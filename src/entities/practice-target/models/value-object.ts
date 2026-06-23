import type { LineId, SentenceId, SessionId } from "@/entities/value-object";

import type { PracticeType } from "@/entities/practice-target/models/enums";

export type PracticeTarget =
  | {
      readonly practiceType: PracticeType.ROLEPLAY;
      readonly sessionId: SessionId;
      readonly lineSnapshotId: LineId;
    }
  | {
      readonly practiceType: PracticeType.MEMORIZATION;
      readonly sessionId: SessionId;
      readonly sentenceSnapshotId: SentenceId;
    };
