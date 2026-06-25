const ACCEPTED_STT_AUDIO_EXTENSIONS = new Set([
  "flac",
  "mp3",
  "mp4",
  "mpeg",
  "mpga",
  "m4a",
  "ogg",
  "wav",
  "webm",
]);

export function isAcceptedSTTAudioExtension(extension: string): boolean {
  return ACCEPTED_STT_AUDIO_EXTENSIONS.has(extension.toLowerCase());
}

export function getFilenameExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex + 1).toLowerCase() : "";
}
