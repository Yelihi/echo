import { CleanupFailureSource } from "@/entities/cleanup-failure-log";
import type { CleanupFailureLogRepositoryPort } from "@/entities/cleanup-failure-log/models/repository";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";
import { PracticeType } from "@/entities/practice-target";
import type { RecordingAudio, RecordingId, UserId } from "@/entities/value-object";
import { buildRecordingObjectPath } from "@/shared/lib/recording-storage/server/path";

import { createCleanupFailureInput, recordCleanupFailure } from "./cleanupFailure";
import {
  assertDraftRecordingFound,
  assertRecordingOwner,
  assertUnlinkedDraftRecording,
} from "./recordingCleanupPolicy";
import type {
  AcceptDraftRecordingWorkflowInput,
  CreateAcceptedRecordingPlaybackUrlWorkflowInput,
  CreateDraftRecordingWorkflowInput,
  DeleteUnacceptedDraftRecordingWorkflowInput,
  RecordingStoragePort,
} from "./types";

const RECORDINGS_BUCKET = "recordings";
const DRAFT_CLEANUP_SOURCE = CleanupFailureSource.DRAFT_RECORDING;
const ACCEPTED_CLEANUP_SOURCE = CleanupFailureSource.ACCEPTED_RECORDING;

export async function createDraftRecording(input: CreateDraftRecordingWorkflowInput) {
  const recordingId = input.recordingId ?? (crypto.randomUUID() as RecordingId);
  const objectPath = buildRecordingObjectPath({
    userId: input.userId,
    sessionId: input.target.sessionId,
    recordingId,
    mimeType: input.file.type,
  });

  await input.storage.upload({
    objectPath,
    file: input.file,
    contentType: input.file.type,
  });

  try {
    if (input.target.practiceType === "roleplay") {
      return await input.draftRepository.create({
        id: recordingId,
        ownerId: input.userId,
        practiceType: "roleplay",
        roleplaySessionId: input.target.sessionId,
        roleplayLineId: input.target.lineSnapshotId,
        bucketId: RECORDINGS_BUCKET,
        objectPath,
        mimeType: input.file.type,
        sizeBytes: input.file.size,
        durationMs: input.durationMs,
      });
    }

    return await input.draftRepository.create({
      id: recordingId,
      ownerId: input.userId,
      practiceType: "memorization",
      memorizationSessionId: input.target.sessionId,
      memorizationSentenceId: input.target.sentenceSnapshotId,
      bucketId: RECORDINGS_BUCKET,
      objectPath,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      durationMs: input.durationMs,
    });
  } catch (createError) {
    try {
      await input.storage.remove(objectPath);
    } catch (removeError) {
      await recordCleanupFailure(
        createCleanupFailureInput({
          repository: input.cleanupFailureLogRepository,
          source: DRAFT_CLEANUP_SOURCE,
          userId: input.userId,
          bucketId: RECORDINGS_BUCKET,
          objectPath,
          mimeType: input.file.type,
          sizeBytes: input.file.size,
          durationMs: input.durationMs,
          error: removeError,
        }),
      );
    }

    throw createError;
  }
}

export async function acceptDraftRecording(input: AcceptDraftRecordingWorkflowInput) {
  const draft = await input.draftRepository.findById(input.draftRecordingId);

  assertDraftRecordingFound(draft);
  assertRecordingOwner(draft.ownerId, input.userId);

  const existingAccepted =
    draft.target.practiceType === PracticeType.ROLEPLAY
      ? await input.acceptedRepository.findByRoleplayTarget(
          draft.target.sessionId,
          draft.target.lineSnapshotId,
        )
      : await input.acceptedRepository.findByMemorizationTarget(
          draft.target.sessionId,
          draft.target.sentenceSnapshotId,
        );

  const accepted = await upsertAcceptedFromDraft(input, draft);

  await input.draftRepository.deleteById(draft.id);
  await removeReplacedAcceptedObject({
    userId: input.userId,
    previousAudio: existingAccepted?.audio,
    acceptedAudio: accepted.audio,
    storage: input.storage,
    cleanupFailureLogRepository: input.cleanupFailureLogRepository,
  });

  return accepted;
}

export async function createAcceptedRecordingPlaybackUrl(
  input: CreateAcceptedRecordingPlaybackUrlWorkflowInput,
) {
  const accepted = await input.acceptedRepository.findById(input.recordingId);

  if (!accepted) {
    throw new Error("Accepted recording not found");
  }
  assertRecordingOwner(accepted.ownerId, input.userId);

  return input.storage.createSignedPlaybackUrl(accepted.audio.objectPath);
}

export async function deleteUnacceptedDraftRecording(
  input: DeleteUnacceptedDraftRecordingWorkflowInput,
): Promise<void> {
  const draft = await input.draftRepository.findById(input.draftRecordingId);

  assertDraftRecordingFound(draft);
  assertRecordingOwner(draft.ownerId, input.userId);

  const accepted = await input.acceptedRepository.findByStorageObject(
    draft.audio.bucketId,
    draft.audio.objectPath,
  );

  assertUnlinkedDraftRecording(accepted);

  try {
    await input.storage.remove(draft.audio.objectPath);
  } catch (removeError) {
    await recordCleanupFailure(
      createCleanupFailureInput({
        repository: input.cleanupFailureLogRepository,
        source: DRAFT_CLEANUP_SOURCE,
        userId: input.userId,
        bucketId: draft.audio.bucketId,
        objectPath: draft.audio.objectPath,
        mimeType: draft.audio.mimeType,
        sizeBytes: draft.audio.sizeBytes,
        durationMs: draft.audio.durationMs,
        error: removeError,
      }),
    );
    throw removeError;
  }

  await input.draftRepository.deleteById(draft.id);
}

async function upsertAcceptedFromDraft(
  input: AcceptDraftRecordingWorkflowInput,
  draft: DraftRecording,
) {
  if (draft.target.practiceType === PracticeType.ROLEPLAY) {
    return input.acceptedRepository.upsertFromDraft({
      ownerId: input.userId,
      practiceType: "roleplay",
      roleplaySessionId: draft.target.sessionId,
      roleplayLineId: draft.target.lineSnapshotId,
      bucketId: draft.audio.bucketId,
      objectPath: draft.audio.objectPath,
      mimeType: draft.audio.mimeType,
      sizeBytes: draft.audio.sizeBytes,
      durationMs: draft.audio.durationMs,
    });
  }

  return input.acceptedRepository.upsertFromDraft({
    ownerId: input.userId,
    practiceType: "memorization",
    memorizationSessionId: draft.target.sessionId,
    memorizationSentenceId: draft.target.sentenceSnapshotId,
    bucketId: draft.audio.bucketId,
    objectPath: draft.audio.objectPath,
    mimeType: draft.audio.mimeType,
    sizeBytes: draft.audio.sizeBytes,
    durationMs: draft.audio.durationMs,
  });
}

async function removeReplacedAcceptedObject(input: {
  readonly userId: UserId;
  readonly previousAudio?: RecordingAudio;
  readonly acceptedAudio: RecordingAudio;
  readonly storage: Pick<RecordingStoragePort, "remove">;
  readonly cleanupFailureLogRepository?: CleanupFailureLogRepositoryPort;
}): Promise<void> {
  if (!input.previousAudio || isSameStorageObject(input.previousAudio, input.acceptedAudio)) {
    return;
  }

  try {
    await input.storage.remove(input.previousAudio.objectPath);
  } catch (removeError) {
    await recordCleanupFailure(
      createCleanupFailureInput({
        repository: input.cleanupFailureLogRepository,
        source: ACCEPTED_CLEANUP_SOURCE,
        userId: input.userId,
        bucketId: input.previousAudio.bucketId,
        objectPath: input.previousAudio.objectPath,
        mimeType: input.previousAudio.mimeType,
        sizeBytes: input.previousAudio.sizeBytes,
        durationMs: input.previousAudio.durationMs,
        error: removeError,
      }),
    );
  }
}

function isSameStorageObject(left: RecordingAudio, right: RecordingAudio): boolean {
  return left.bucketId === right.bucketId && left.objectPath === right.objectPath;
}
