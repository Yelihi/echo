import type { AcceptedRecording } from "@/entities/accepted-recording";
import {
  RecordingStorageOperationError,
  type RecordingStorageService,
} from "@/shared/lib/recording-storage/server";
import { recordOperationEvent } from "@/shared/lib/logging/pino";

export async function createAudioDto(
  storage: Pick<RecordingStorageService, "createSignedPlaybackUrl">,
  recording: AcceptedRecording,
) {
  let signedUrl: string;
  try {
    ({ signedUrl } = await storage.createSignedPlaybackUrl(recording.audio.objectPath));
  } catch (error) {
    if (!(error instanceof RecordingStorageOperationError)) throw error;
    recordOperationEvent({
      operation: "recording.playback.url",
      operationId: crypto.randomUUID(),
      resourceId: recording.id,
      phase: "failed",
    });
    return undefined;
  }

  return {
    signedUrl,
    durationSec:
      recording.audio.durationMs === null
        ? undefined
        : Math.round(recording.audio.durationMs / 1000),
  };
}
