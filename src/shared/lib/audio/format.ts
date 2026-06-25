import { SUPPORTED_AUDIO_FORMATS } from "@/shared/lib/audio/config";
import type { AudioFormat, AudioTypeSupportChecker } from "@/shared/lib/audio/types";

export function chooseSupportedAudioFormat(
  isTypeSupported: AudioTypeSupportChecker,
): AudioFormat | null {
  return SUPPORTED_AUDIO_FORMATS.find((format) => isTypeSupported(format.mimeType)) ?? null;
}
