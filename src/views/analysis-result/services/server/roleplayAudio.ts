import { PracticeType } from "@/entities/practice-target";
import type { AcceptedRecording } from "@/entities/accepted-recording";
import type { LineId } from "@/entities/value-object";
import type { RecordingStorageService } from "@/shared/lib/recording-storage/server";

import { createAudioDto } from "./audioDto";

export async function createRoleplayAudioByLineId(
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
