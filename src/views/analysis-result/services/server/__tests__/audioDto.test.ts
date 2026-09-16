/** @jest-environment node */
import { expect, it, jest } from "@jest/globals";
import { PracticeType } from "@/entities/practice-target";
import type { AcceptedRecording } from "@/entities/accepted-recording";
import type { LineId, RecordingId, SentenceId, SessionId, UserId } from "@/entities/value-object";
import { RecordingStorageOperationError } from "@/shared/lib/recording-storage/server";

jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));

function recording(id: string, kind: "roleplay" | "memorization"): AcceptedRecording {
  return {
    id: id as RecordingId,
    ownerId: "owner" as UserId,
    target:
      kind === "roleplay"
        ? {
            practiceType: PracticeType.ROLEPLAY,
            sessionId: "session" as SessionId,
            lineSnapshotId: id as LineId,
          }
        : {
            practiceType: PracticeType.MEMORIZATION,
            sessionId: "session" as SessionId,
            sentenceSnapshotId: id as SentenceId,
          },
    audio: {
      bucketId: "recordings",
      objectPath: id,
      mimeType: "audio/webm",
      sizeBytes: 1000,
      durationMs: 1500,
    },
    acceptedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

it.each(["roleplay", "memorization"] as const)(
  "%s 결과는 없는 오디오만 제외하고 나머지 재생 URL을 유지한다",
  async (kind) => {
    const { createRoleplayAudioByLineId } = await import("../roleplayAudio");
    const { createMemorizationAudioBySentenceId } = await import("../memorizationAudio");
    const { recordOperationEvent } = await import("@/shared/lib/logging/pino");
    const storage = {
      createSignedPlaybackUrl: async (path: string) => {
        if (path === "missing")
          throw new RecordingStorageOperationError("create signed playback URL", {
            cause: { statusCode: "404", message: "Object not found" },
          });
        return { signedUrl: "/available.webm", expiresInSeconds: 600 };
      },
    };
    const map = await (
      kind === "roleplay" ? createRoleplayAudioByLineId : createMemorizationAudioBySentenceId
    )(storage, [recording("missing", kind), recording("available", kind)]);
    expect([...map.keys()]).toEqual(["available"]);
    expect([...map.values()]).toEqual([{ signedUrl: "/available.webm", durationSec: 2 }]);
    expect(recordOperationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ phase: "failed", resourceId: "missing" }),
    );
  },
);

it("예상하지 못한 프로그래밍 오류를 오디오 없음으로 숨기지 않는다", async () => {
  const { createAudioDto } = await import("../audioDto");
  await expect(
    createAudioDto(
      {
        createSignedPlaybackUrl: async () => {
          throw new TypeError("bad adapter");
        },
      },
      recording("any", "roleplay"),
    ),
  ).rejects.toThrow("bad adapter");
});
