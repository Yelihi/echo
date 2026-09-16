import { PracticeType } from "@/entities/practice-target";
import type { AcceptedRecording } from "@/entities/accepted-recording";
import type { SentenceId } from "@/entities/value-object";
import type { RecordingStorageService } from "@/shared/lib/recording-storage/server";

import { createAudioDto } from "./audioDto";

export async function createMemorizationAudioBySentenceId(
  storage: Pick<RecordingStorageService, "createSignedPlaybackUrl">,
  recordings: ReadonlyArray<AcceptedRecording>,
) {
  const entries = await Promise.all(
    recordings.map(async (recording) => {
      if (recording.target.practiceType !== PracticeType.MEMORIZATION) {
        return null;
      }

      const audio = await createAudioDto(storage, recording);
      return audio ? ([recording.target.sentenceSnapshotId, audio] as const) : null;
    }),
  );

  return new Map(
    entries.filter(
      (
        entry,
      ): entry is readonly [SentenceId, NonNullable<Awaited<ReturnType<typeof createAudioDto>>>] =>
        Boolean(entry),
    ),
  );
}
