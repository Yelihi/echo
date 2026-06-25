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

  async start(): Promise<void> {
    if (this.status !== "idle") {
      throw new AudioCaptureError(
        "recorder-start-failed",
        "Audio recording cannot start while another recording operation is active.",
      );
    }

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
      this.stream = await this.getUserMedia({ audio: true });
      this.format = format;
      this.chunks = [];
      this.startedAtMs = this.clock.now();
      this.recorder = this.createRecorder(this.stream, { mimeType: format.mimeType });
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };
      this.recorder.start();
      this.status = "recording";
    } catch (cause) {
      this.stopStreamTracks();
      this.reset();
      throw mapAudioCaptureStartError(cause);
    }
  }

  async stop(): Promise<CapturedAudio> {
    if (this.status !== "recording" || !this.recorder || !this.format) {
      throw new AudioCaptureError(
        "recorder-stop-failed",
        "Audio recording cannot stop because no recording is active.",
      );
    }

    this.status = "stopping";
    const recorder = this.recorder;
    const format = this.format;

    try {
      await this.stopRecorder(recorder);
      const durationMs = this.clock.now() - this.startedAtMs;
      const blob = new Blob(this.chunks, { type: format.mimeType });

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
      this.stopStreamTracks();
      this.reset();
    }
  }

  cancel(): void {
    try {
      if (this.recorder?.state !== "inactive") {
        this.recorder?.stop();
      }
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
    this.status = "idle";
    this.recorder = null;
    this.stream = null;
    this.format = null;
    this.startedAtMs = 0;
    this.chunks = [];
  }
}
