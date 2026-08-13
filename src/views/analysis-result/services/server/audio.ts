import { PracticeType } from "@/entities/practice-target";
import type { AcceptedRecording } from "@/entities/accepted-recording";
import type { LineId, SentenceId } from "@/entities/value-object";
import type { RecordingStorageService } from "@/shared/lib/recording-storage/server";

export async function createAudioByLineId(
  storage: RecordingStorageService,
  recordings: ReadonlyArray<AcceptedRecording>,
) {
  const entries = await Promise.all(
    recordings.map(async (recording) => {
      if (recording.target.practiceType !== PracticeType.ROLEPLAY) {
        return null;
      }

      return [recording.target.lineSnapshotId, await createAudioDto(storage, recording)] as const;
    }),
  );

  return new Map(
    entries.filter(
      (entry): entry is readonly [LineId, Awaited<ReturnType<typeof createAudioDto>>] =>
        Boolean(entry),
    ),
  );
}

export async function createAudioBySentenceId(
  storage: RecordingStorageService,
  recordings: ReadonlyArray<AcceptedRecording>,
) {
  const entries = await Promise.all(
    recordings.map(async (recording) => {
      if (recording.target.practiceType !== PracticeType.MEMORIZATION) {
        return null;
      }

      return [
        recording.target.sentenceSnapshotId,
        await createAudioDto(storage, recording),
      ] as const;
    }),
  );

  return new Map(
    entries.filter(
      (entry): entry is readonly [SentenceId, Awaited<ReturnType<typeof createAudioDto>>] =>
        Boolean(entry),
    ),
  );
}

async function createAudioDto(storage: RecordingStorageService, recording: AcceptedRecording) {
  const { signedUrl } = await storage.createSignedPlaybackUrl(recording.audio.objectPath);

  return {
    signedUrl,
    durationSec:
      recording.audio.durationMs === null
        ? undefined
        : Math.round(recording.audio.durationMs / 1000),
  };
}
