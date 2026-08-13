import type { AcceptedRecording } from "@/entities/accepted-recording";
import type { RecordingStorageService } from "@/shared/lib/recording-storage/server";

export async function createAudioDto(
  storage: RecordingStorageService,
  recording: AcceptedRecording,
) {
  const { signedUrl } = await storage.createSignedPlaybackUrl(recording.audio.objectPath);

  return {
    signedUrl,
    durationSec:
      recording.audio.durationMs === null
        ? undefined
        : Math.round(recording.audio.durationMs / 1000),
  };
}
