import type { RecordingAudio, UserId } from "@/shared/domain/value-objects";

import type { CleanupFailureSource } from "./enums";

export interface CleanupFailureLog {
  readonly id: string;
  readonly ownerId: UserId;
  readonly source: CleanupFailureSource;
  readonly audio: RecordingAudio;
  readonly errorMessage: string;
  readonly attemptedAt: Date;
  readonly createdAt: Date;
}
