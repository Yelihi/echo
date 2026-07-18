import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";
import type { UserId } from "@/entities/value-object";

export function assertDraftRecordingFound(
  draft: DraftRecording | null,
): asserts draft is DraftRecording {
  if (!draft) {
    throw new Error("Draft recording not found");
  }
}

export function assertRecordingOwner(ownerId: UserId, userId: UserId): void {
  if (ownerId !== userId) {
    throw new Error("Recording does not belong to user");
  }
}

export function assertUnlinkedDraftRecording(accepted: AcceptedRecording | null): void {
  if (accepted) {
    throw new Error("Cannot delete accepted recording object");
  }
}
