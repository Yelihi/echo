export type SupportedAudioMimeType =
  | "audio/webm;codecs=opus"
  | "audio/webm"
  | "audio/mp4"
  | "audio/mp4;codecs=mp4a.40.2"
  | "audio/aac"
  | "audio/wav";

export type SupportedAudioExtension = "webm" | "mp4" | "aac" | "wav";

export interface CapturedAudio {
  readonly blob: Blob;
  readonly mimeType: SupportedAudioMimeType;
  readonly extension: SupportedAudioExtension;
  readonly durationMs: number;
}

export interface AudioFormat {
  readonly mimeType: SupportedAudioMimeType;
  readonly extension: SupportedAudioExtension;
}

export type AudioTypeSupportChecker = (mimeType: string) => boolean;

export interface AudioClock {
  now: () => number;
}

export type AudioCaptureStatus = "idle" | "starting" | "recording" | "stopping";

export interface AudioCaptureRecorder {
  readonly state: RecordingState;
  ondataavailable: ((event: BlobEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onstop: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
}

export type AudioCaptureRecorderFactory = (
  stream: MediaStream,
  options: MediaRecorderOptions,
) => AudioCaptureRecorder;

export type GetUserMedia = (constraints: MediaStreamConstraints) => Promise<MediaStream>;

export interface AudioCaptureOptions {
  readonly getUserMedia?: GetUserMedia;
  readonly createRecorder?: AudioCaptureRecorderFactory;
  readonly isTypeSupported?: AudioTypeSupportChecker;
  readonly clock?: AudioClock;
  readonly stopTimeoutMs?: number;
}
