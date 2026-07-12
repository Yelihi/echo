import { UnsupportedRecordingMimeTypeError } from "./errors";

const MIME_EXTENSION = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
} as const;

export type SupportedRecordingMimeType = keyof typeof MIME_EXTENSION;

export type BuildRecordingObjectPathInput = {
  userId: string;
  sessionId: string;
  recordingId: string;
  mimeType: string;
};

export function getRecordingExtensionFromMimeType(mimeType: string): string {
  const extension = MIME_EXTENSION[mimeType as SupportedRecordingMimeType];

  if (!extension) {
    throw new UnsupportedRecordingMimeTypeError(mimeType);
  }

  return extension;
}

export function buildRecordingObjectPath(input: BuildRecordingObjectPathInput): string {
  return `${input.userId}/${input.sessionId}/${input.recordingId}.${getRecordingExtensionFromMimeType(input.mimeType)}`;
}
