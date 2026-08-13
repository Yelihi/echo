import { PracticeType } from "@/entities/practice-target";
import type { AcceptedRecording } from "@/entities/accepted-recording";
import type { SentenceId } from "@/entities/value-object";
import type { RecordingStorageService } from "@/shared/lib/recording-storage/server";

import { createAudioDto } from "./audioDto";

export async function createMemorizationAudioBySentenceId(
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
