import type { LineId, SentenceId, SessionId } from "@/shared/domain/value-objects";

import type { PracticeType } from "./enums";

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
