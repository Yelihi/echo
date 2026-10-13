import {
  AudioCaptureError,
  mapAudioCaptureStartError,
  mapAudioCaptureStopError,
} from "@/shared/lib/audio/errors";
import { chooseSupportedAudioFormat } from "@/shared/lib/audio/format";
import type {
  AudioCaptureOptions,
  AudioCaptureRecorder,
  AudioCaptureStatus,
  AudioClock,
  AudioFormat,
  CapturedAudio,
  GetUserMedia,
} from "@/shared/lib/audio/types";

const defaultClock: AudioClock = {
  now: () => performance.now(),
};

const DEFAULT_STOP_TIMEOUT_MS = 5000;

const defaultGetUserMedia: GetUserMedia = (constraints) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(
      new AudioCaptureError("recorder-unavailable", "Media devices are not available."),
    );
  }

  return navigator.mediaDevices.getUserMedia(constraints);
};

export class AudioCapture {
  private readonly getUserMedia: GetUserMedia;
  private readonly createRecorder: NonNullable<AudioCaptureOptions["createRecorder"]>;
  private readonly isTypeSupported: NonNullable<AudioCaptureOptions["isTypeSupported"]>;
  private readonly clock: AudioClock;
  private readonly stopTimeoutMs: number;
  private status: AudioCaptureStatus = "idle";
  private recorder: AudioCaptureRecorder | null = null;
  private stream: MediaStream | null = null;
  private format: AudioFormat | null = null;
  private startedAtMs = 0;
  private chunks: Blob[] = [];
  private attempt: symbol | null = null;
  private startedAtWallMs = 0;

  constructor(options: AudioCaptureOptions = {}) {
    const BrowserMediaRecorder = typeof MediaRecorder === "undefined" ? null : MediaRecorder;

    this.getUserMedia = options.getUserMedia ?? defaultGetUserMedia;
    this.createRecorder =
      options.createRecorder ??
      ((stream, recorderOptions) => {
        if (!BrowserMediaRecorder) {
          throw new AudioCaptureError("recorder-unavailable", "MediaRecorder is not available.");
        }

        return new BrowserMediaRecorder(stream, recorderOptions);
      });
    this.isTypeSupported =
      options.isTypeSupported ??
      ((mimeType) => Boolean(BrowserMediaRecorder?.isTypeSupported(mimeType)));
    this.clock = options.clock ?? defaultClock;
    this.stopTimeoutMs = options.stopTimeoutMs ?? DEFAULT_STOP_TIMEOUT_MS;
  }

  getStatus(): AudioCaptureStatus {
    return this.status;
  }

  getElapsedMs(): number {
    return Math.max(
      0,
      this.clock.now() - this.startedAtMs,
      this.clock === defaultClock ? Date.now() - this.startedAtWallMs : 0,
    );
  }

  async start(): Promise<number | null> {
    if (this.status !== "idle") {
      throw new AudioCaptureError(
        "recorder-start-failed",
        "Audio recording cannot start while another recording operation is active.",
      );
    }

    const attempt = Symbol("capture");
    this.attempt = attempt;
    this.status = "starting";
    const format = chooseSupportedAudioFormat(this.isTypeSupported);

    if (!format) {
      this.reset();
      throw new AudioCaptureError(
        "unsupported-format",
        "No supported audio recording format is available.",
      );
    }

    try {
      const stream = await this.getUserMedia({ audio: true });
      if (this.attempt !== attempt) {
        stream.getTracks().forEach((track) => track.stop());
        return null;
      }
      this.stream = stream;
      this.format = format;
      this.chunks = [];
      this.recorder = this.createRecorder(this.stream, { mimeType: format.mimeType });
      this.recorder.ondataavailable = (event) => {
        if (this.attempt === attempt && event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };
      this.recorder.start();
      this.startedAtMs = this.clock.now();
      this.startedAtWallMs = Date.now();
      this.status = "recording";
      return this.startedAtMs;
    } catch (cause) {
      if (this.attempt !== attempt) return null;
      this.stopStreamTracks();
      this.reset();
      throw mapAudioCaptureStartError(cause);
    }
  }

  async stop(maxDurationMs?: number): Promise<CapturedAudio> {
    if (this.status !== "recording" || !this.recorder || !this.format) {
      throw new AudioCaptureError(
        "recorder-stop-failed",
        "Audio recording cannot stop because no recording is active.",
      );
    }

    this.status = "stopping";
    const recorder = this.recorder;
    const format = this.format;
    const attempt = this.attempt;
    const chunks = this.chunks;
    const durationMs = this.getElapsedMs();
    if (maxDurationMs !== undefined && durationMs >= maxDurationMs) {
      this.cancel();
      throw new AudioCaptureError(
        "duration-limit-exceeded",
        "Audio recording exceeded its duration limit.",
      );
    }

    try {
      await this.stopRecorder(recorder);
      if (this.attempt !== attempt) {
        throw new AudioCaptureError("recorder-stop-failed", "Audio recording was canceled.");
      }
      const blob = new Blob(chunks, { type: format.mimeType });

      if (blob.size === 0) {
        throw new AudioCaptureError("empty-audio-data", "Audio recording did not produce data.");
      }

      return {
        blob,
        mimeType: format.mimeType,
        extension: format.extension,
        durationMs,
      };
    } catch (cause) {
      throw mapAudioCaptureStopError(cause);
    } finally {
      if (this.attempt === attempt) {
        this.stopStreamTracks();
        this.reset();
      }
    }
  }

  cancel(): void {
    this.attempt = null;
    try {
      if (this.recorder?.state !== "inactive") {
        this.recorder?.stop();
      }
    } catch {
      // Cancellation still releases tracks when the browser recorder has already failed.
    } finally {
      this.stopStreamTracks();
      this.reset();
    }
  }

  private stopStreamTracks(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
  }

  private stopRecorder(recorder: AudioCaptureRecorder): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new AudioCaptureError(
            "recorder-stop-failed",
            "Audio recording stop did not complete in time.",
          ),
        );
      }, this.stopTimeoutMs);

      const resolveStop = (): void => {
        clearTimeout(timeoutId);
        resolve();
      };

      const rejectStop = (cause: unknown): void => {
        clearTimeout(timeoutId);
        reject(cause);
      };

      recorder.onerror = (event) => rejectStop(event);
      recorder.onstop = () => resolveStop();

      try {
        if (recorder.state === "inactive") {
          resolveStop();
          return;
        }

        recorder.stop();
      } catch (cause) {
        rejectStop(cause);
      }
    });
  }

  private reset(): void {
    this.attempt = null;
    if (this.recorder) this.recorder.ondataavailable = null;
    this.status = "idle";
    this.recorder = null;
    this.stream = null;
    this.format = null;
    this.startedAtMs = 0;
    this.chunks.length = 0;
    this.chunks = [];
  }
}
