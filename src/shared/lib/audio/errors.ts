/**
 * Browser audio capture failure codes.
 *
 * These codes are intentionally stable because they will later feed the common
 * CustomError/logging layer.
 */
export type AudioCaptureErrorCode =
  /** The learner denied microphone permission, or the browser/OS blocked access. */
  | "permission-denied"
  /** No usable microphone input device was found. */
  | "device-not-found"
  /** None of the app's configured MediaRecorder mime types are supported. */
  | "unsupported-format"
  /** MediaRecorder or getUserMedia is unavailable in the current runtime. */
  | "recorder-unavailable"
  /** A microphone stream was acquired, but recorder creation or start failed. */
  | "recorder-start-failed"
  /** Recorder stop, stop event handling, or recorder error handling failed. */
  | "recorder-stop-failed"
  /** Stop completed, but no audio bytes were emitted. */
  | "empty-audio-data";

export interface AudioCaptureErrorOptions {
  readonly cause?: unknown;
}

export class AudioCaptureError extends Error {
  readonly code: AudioCaptureErrorCode;
  override readonly cause?: unknown;

  constructor(
    code: AudioCaptureErrorCode,
    message: string,
    options: AudioCaptureErrorOptions = {},
  ) {
    super(message);
    this.name = "AudioCaptureError";
    this.code = code;
    this.cause = options.cause;
  }
}

export function mapAudioCaptureStartError(cause: unknown): AudioCaptureError {
  if (cause instanceof AudioCaptureError) {
    return cause;
  }

  if (cause instanceof DOMException && cause.name === "NotAllowedError") {
    return new AudioCaptureError("permission-denied", "Microphone permission was denied.", {
      cause,
    });
  }

  if (cause instanceof DOMException && cause.name === "NotFoundError") {
    return new AudioCaptureError("device-not-found", "No microphone input device was found.", {
      cause,
    });
  }

  return new AudioCaptureError("recorder-start-failed", "Audio recording failed to start.", {
    cause,
  });
}

export function mapAudioCaptureStopError(cause: unknown): AudioCaptureError {
  if (cause instanceof AudioCaptureError) {
    return cause;
  }

  return new AudioCaptureError("recorder-stop-failed", "Audio recording failed to stop.", {
    cause,
  });
}
