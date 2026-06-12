import type { PracticeTarget } from "@/entities/practice-target";
import type { RecordingAudio, RecordingId, UserId } from "@/shared/domain/value-objects";

export interface AcceptedRecording {
  readonly id: RecordingId;
  readonly ownerId: UserId;
  readonly target: PracticeTarget;
  readonly audio: RecordingAudio;
  readonly acceptedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
