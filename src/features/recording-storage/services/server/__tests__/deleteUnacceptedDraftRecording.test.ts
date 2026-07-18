import { describe, expect, it, jest } from "@jest/globals";

import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import type { AcceptedRecordingRepositoryPort } from "@/entities/accepted-recording/models/repository";
import { CleanupFailureSource } from "@/entities/cleanup-failure-log";
import type { CleanupFailureLogRepositoryPort } from "@/entities/cleanup-failure-log/models/repository";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";
import type { DraftRecordingRepositoryPort } from "@/entities/draft-recording/models/repository";
import { PracticeType } from "@/entities/practice-target";
import type { LineId, RecordingId, SessionId, UserId } from "@/entities/value-object";
import type { RecordingStoragePort } from "@/features/recording-storage/services/server/types";
import { deleteUnacceptedDraftRecording } from "@/features/recording-storage/services/server/workflows";

describe("deleteUnacceptedDraftRecording", () => {
  it("should reject missing draft recording", async () => {
    // Given
    const draftRepository = createDraftRepository({ draft: null });
    const acceptedRepository = createAcceptedRepository({ accepted: null });
    const storage = createStorage();

    // When & Then
    await expect(
      deleteUnacceptedDraftRecording({
        userId: "user-1" as UserId,
        draftRecordingId: "recording-1" as RecordingId,
        draftRepository,
        acceptedRepository,
        storage,
      }),
    ).rejects.toThrow("Draft recording not found");
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("should reject draft recording owned by another user", async () => {
    // Given
    const draftRepository = createDraftRepository({
      draft: createDraftRecording({ ownerId: "other-user" as UserId }),
    });
    const acceptedRepository = createAcceptedRepository({ accepted: null });
    const storage = createStorage();

    // When & Then
    await expect(
      deleteUnacceptedDraftRecording({
        userId: "user-1" as UserId,
        draftRecordingId: "recording-1" as RecordingId,
        draftRepository,
        acceptedRepository,
        storage,
      }),
    ).rejects.toThrow("Recording does not belong to user");
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("should reject draft recording when its storage object is linked to accepted recording", async () => {
    // Given
    const draft = createDraftRecording();
    const draftRepository = createDraftRepository({ draft });
    const acceptedRepository = createAcceptedRepository({
      accepted: createAcceptedRecording({ audio: draft.audio }),
    });
    const storage = createStorage();

    // When & Then
    await expect(
      deleteUnacceptedDraftRecording({
        userId: "user-1" as UserId,
        draftRecordingId: draft.id,
        draftRepository,
        acceptedRepository,
        storage,
      }),
    ).rejects.toThrow("Cannot delete accepted recording object");
    expect(storage.remove).not.toHaveBeenCalled();
    expect(draftRepository.deleteById).not.toHaveBeenCalled();
  });

  it("should remove orphan draft object then delete draft row", async () => {
    // Given
    const draft = createDraftRecording();
    const draftRepository = createDraftRepository({ draft });
    const acceptedRepository = createAcceptedRepository({ accepted: null });
    const storage = createStorage();

    // When
    await deleteUnacceptedDraftRecording({
      userId: "user-1" as UserId,
      draftRecordingId: draft.id,
      draftRepository,
      acceptedRepository,
      storage,
    });

    // Then
    expect(storage.remove).toHaveBeenCalledWith(draft.audio.objectPath);
    expect(draftRepository.deleteById).toHaveBeenCalledWith(draft.id);
  });

  it("should log cleanup failure and keep storage error when object removal fails", async () => {
    // Given
    const draft = createDraftRecording();
    const removeError = new Error("storage unavailable");
    const draftRepository = createDraftRepository({ draft });
    const acceptedRepository = createAcceptedRepository({ accepted: null });
    const storage = createStorage({ removeError });
    const cleanupFailureLogRepository = createCleanupFailureLogRepository();

    // When & Then
    await expect(
      deleteUnacceptedDraftRecording({
        userId: "user-1" as UserId,
        draftRecordingId: draft.id,
        draftRepository,
        acceptedRepository,
        storage,
        cleanupFailureLogRepository,
      }),
    ).rejects.toThrow(removeError);
    expect(cleanupFailureLogRepository.create).toHaveBeenCalledWith({
      source: CleanupFailureSource.DRAFT_RECORDING,
      userId: "user-1",
      bucketId: draft.audio.bucketId,
      objectPath: draft.audio.objectPath,
      mimeType: draft.audio.mimeType,
      sizeBytes: draft.audio.sizeBytes,
      durationMs: draft.audio.durationMs,
      errorMessage: "storage unavailable",
    });
    expect(draftRepository.deleteById).not.toHaveBeenCalled();
  });

  it("should keep storage error when cleanup failure logging also fails", async () => {
    // Given
    const draft = createDraftRecording();
    const removeError = new Error("storage unavailable");
    const draftRepository = createDraftRepository({ draft });
    const acceptedRepository = createAcceptedRepository({ accepted: null });
    const storage = createStorage({ removeError });
    const cleanupFailureLogRepository = createCleanupFailureLogRepository({
      createError: new Error("log unavailable"),
    });

    // When & Then
    await expect(
      deleteUnacceptedDraftRecording({
        userId: "user-1" as UserId,
        draftRecordingId: draft.id,
        draftRepository,
        acceptedRepository,
        storage,
        cleanupFailureLogRepository,
      }),
    ).rejects.toThrow(removeError);
  });
});

function createDraftRecording(overrides: Partial<DraftRecording> = {}): DraftRecording {
  return {
    id: "recording-1" as RecordingId,
    ownerId: "user-1" as UserId,
    target: {
      practiceType: PracticeType.ROLEPLAY,
      sessionId: "session-1" as SessionId,
      lineSnapshotId: "line-1" as LineId,
    },
    audio: {
      bucketId: "recordings",
      objectPath: "user-1/session-1/recording-1.webm",
      mimeType: "audio/webm",
      sizeBytes: 100,
      durationMs: 1000,
    },
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function createAcceptedRecording(overrides: Partial<AcceptedRecording> = {}): AcceptedRecording {
  return {
    ...createDraftRecording(),
    acceptedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function createDraftRepository(input: {
  draft: DraftRecording | null;
}): DraftRecordingRepositoryPort {
  return {
    create: jest.fn<DraftRecordingRepositoryPort["create"]>(),
    deleteById: jest.fn<NonNullable<DraftRecordingRepositoryPort["deleteById"]>>(),
    findById: jest.fn(async () => input.draft),
    findByRoleplayTarget:
      jest.fn<NonNullable<DraftRecordingRepositoryPort["findByRoleplayTarget"]>>(),
    findByMemorizationTarget:
      jest.fn<NonNullable<DraftRecordingRepositoryPort["findByMemorizationTarget"]>>(),
  };
}

function createAcceptedRepository(input: {
  accepted: AcceptedRecording | null;
}): AcceptedRecordingRepositoryPort {
  return {
    upsertFromDraft: jest.fn<AcceptedRecordingRepositoryPort["upsertFromDraft"]>(),
    findByStorageObject: jest.fn(async () => input.accepted),
    findById: jest.fn<AcceptedRecordingRepositoryPort["findById"]>(),
    findByRoleplayTarget: jest.fn<AcceptedRecordingRepositoryPort["findByRoleplayTarget"]>(),
    findByMemorizationTarget:
      jest.fn<AcceptedRecordingRepositoryPort["findByMemorizationTarget"]>(),
  };
}

function createStorage(options: { removeError?: Error } = {}): RecordingStoragePort {
  return {
    upload: jest.fn(async () => undefined),
    createSignedPlaybackUrl: jest.fn(async () => ({
      signedUrl: "https://example.test/audio.webm",
      expiresInSeconds: 60,
    })),
    remove: jest.fn(async () => {
      if (options.removeError) {
        throw options.removeError;
      }
    }),
  };
}

function createCleanupFailureLogRepository(
  options: { createError?: Error } = {},
): CleanupFailureLogRepositoryPort {
  return {
    create: jest.fn(async () => {
      if (options.createError) {
        throw options.createError;
      }

      return {
        id: "cleanup-1",
        ownerId: "user-1" as UserId,
        source: CleanupFailureSource.DRAFT_RECORDING,
        audio: createDraftRecording().audio,
        errorMessage: "storage unavailable",
        attemptedAt: new Date("2026-01-01T00:00:00Z"),
        createdAt: new Date("2026-01-01T00:00:00Z"),
      };
    }),
    findById: jest.fn(async () => null),
    findMany: jest.fn(async () => []),
  };
}
