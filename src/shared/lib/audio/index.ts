export { AudioCapture } from "@/shared/lib/audio/AudioCapture";
export { SUPPORTED_AUDIO_FORMATS } from "@/shared/lib/audio/config";
export {
  AudioCaptureError,
  mapAudioCaptureStartError,
  mapAudioCaptureStopError,
} from "@/shared/lib/audio/errors";
export type { AudioCaptureErrorCode } from "@/shared/lib/audio/errors";
export { chooseSupportedAudioFormat } from "@/shared/lib/audio/format";
export type {
  AudioCaptureOptions,
  AudioCaptureRecorder,
  AudioCaptureRecorderFactory,
  AudioCaptureStatus,
  AudioClock,
  AudioFormat,
  AudioTypeSupportChecker,
  CapturedAudio,
  GetUserMedia,
  SupportedAudioExtension,
  SupportedAudioMimeType,
} from "@/shared/lib/audio/types";
