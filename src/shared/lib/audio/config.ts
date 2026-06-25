import type { AudioFormat } from "@/shared/lib/audio/types";

export const SUPPORTED_AUDIO_FORMATS: readonly AudioFormat[] = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/mp4", extension: "mp4" },
  { mimeType: "audio/mp4;codecs=mp4a.40.2", extension: "mp4" },
  { mimeType: "audio/aac", extension: "aac" },
  { mimeType: "audio/wav", extension: "wav" },
] as const;
