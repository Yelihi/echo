# Audio Capture and Recording State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 브라우저별 `MediaRecorder` 차이를 감싸는 오디오 캡처 유틸과 UI 독립적인 녹음 상태 모델을 구현한다.

**Architecture:** `src/shared/model/recording`은 순수 상태 모델만 담당하고, `src/shared/lib/audio`는 브라우저 `MediaRecorder` 접근만 담당한다. UI hook, Supabase Storage, OpenAI STT 호출은 이번 범위에서 제외한다.

**Tech Stack:** TypeScript, Jest, jsdom, browser `MediaRecorder`, browser `MediaStream`.

---

## File Structure

- Create: `src/shared/model/recording/types.ts`
  - 녹음 상태, 액션, 에러 타입을 정의한다.
- Create: `src/shared/model/recording/reducer.ts`
  - 상태 전이 reducer와 초기 상태를 정의한다.
- Create: `src/shared/model/recording/index.ts`
  - recording model public API를 export한다.
- Create: `src/shared/model/recording/__tests__/reducer.test.ts`
  - 상태 전이를 검증한다.
- Create: `src/shared/lib/audio/types.ts`
  - 캡처 결과, 포맷, clock, recorder factory 타입을 정의한다.
- Create: `src/shared/lib/audio/config.ts`
  - 지원 포맷 우선순위와 최소 녹음 길이를 정의한다.
- Create: `src/shared/lib/audio/errors.ts`
  - 브라우저 오류를 `RecordingError`로 매핑한다.
- Create: `src/shared/lib/audio/format.ts`
  - `MediaRecorder.isTypeSupported` 기반 포맷 선택 함수를 구현한다.
- Create: `src/shared/lib/audio/AudioCapture.ts`
  - `start`, `stop`, `cancel`을 제공하는 headless capture class를 구현한다.
- Create: `src/shared/lib/audio/index.ts`
  - audio lib public API를 export한다.
- Create: `src/shared/lib/audio/__tests__/format.test.ts`
  - 포맷 선택 우선순위를 검증한다.
- Create: `src/shared/lib/audio/__tests__/errors.test.ts`
  - DOMException 이름별 오류 매핑을 검증한다.
- Create: `src/shared/lib/audio/__tests__/AudioCapture.test.ts`
  - recorder 이벤트, 최소 길이 discard, stream cleanup을 검증한다.

## Task 1: Recording State Model

**Files:**

- Create: `src/shared/model/recording/types.ts`
- Create: `src/shared/model/recording/reducer.ts`
- Create: `src/shared/model/recording/index.ts`
- Test: `src/shared/model/recording/__tests__/reducer.test.ts`

- [ ] **Step 1: Write the failing reducer test**

```typescript
import {
  createInitialRecordingState,
  recordingReducer,
  type CapturedAudio,
  type RecordingError,
} from "@/shared/model/recording";

const audio: CapturedAudio = {
  blob: new Blob(["audio"], { type: "audio/webm;codecs=opus" }),
  mimeType: "audio/webm;codecs=opus",
  extension: "webm",
  durationMs: 1000,
};

const error: RecordingError = {
  code: "permission-denied",
  message: "Microphone permission was denied.",
};

describe("recordingReducer", () => {
  it("moves idle to permissionRequesting when request starts", () => {
    expect(recordingReducer(createInitialRecordingState(), { type: "requestPermission" })).toEqual({
      status: "permissionRequesting",
    });
  });

  it("moves permissionRequesting to recording when recording starts", () => {
    expect(
      recordingReducer(
        { status: "permissionRequesting" },
        { type: "recordingStarted", startedAtMs: 10 },
      ),
    ).toEqual({ status: "recording", startedAtMs: 10 });
  });

  it("moves recording to recorded when audio is captured", () => {
    expect(
      recordingReducer(
        { status: "recording", startedAtMs: 10 },
        { type: "recordingCaptured", audio },
      ),
    ).toEqual({
      status: "recorded",
      audio,
    });
  });

  it("moves recording to idle when recording is discarded", () => {
    expect(
      recordingReducer({ status: "recording", startedAtMs: 10 }, { type: "recordingDiscarded" }),
    ).toEqual({
      status: "idle",
    });
  });

  it("moves permissionRequesting to failed when capture fails", () => {
    expect(
      recordingReducer({ status: "permissionRequesting" }, { type: "recordingFailed", error }),
    ).toEqual({
      status: "failed",
      error,
    });
  });

  it("resets recorded and failed state to idle on retry", () => {
    expect(recordingReducer({ status: "recorded", audio }, { type: "retry" })).toEqual({
      status: "idle",
    });
    expect(recordingReducer({ status: "failed", error }, { type: "retry" })).toEqual({
      status: "idle",
    });
  });

  it("keeps state unchanged for invalid transitions", () => {
    const idle = createInitialRecordingState();
    expect(recordingReducer(idle, { type: "recordingCaptured", audio })).toBe(idle);
  });
});
```

- [ ] **Step 2: Run the reducer test to verify it fails**

Run: `npm test -- src/shared/model/recording/__tests__/reducer.test.ts --runInBand`

Expected: FAIL because `@/shared/model/recording` does not exist.

- [ ] **Step 3: Implement recording types**

```typescript
export type SupportedAudioMimeType =
  | "audio/webm;codecs=opus"
  | "audio/webm"
  | "audio/mp4"
  | "audio/aac";

export type SupportedAudioExtension = "webm" | "mp4" | "aac";

export interface CapturedAudio {
  blob: Blob;
  mimeType: SupportedAudioMimeType;
  extension: SupportedAudioExtension;
  durationMs: number;
}

export type RecordingErrorCode =
  | "permission-denied"
  | "device-not-found"
  | "unsupported-format"
  | "recorder-unavailable"
  | "recorder-failed";

export interface RecordingError {
  code: RecordingErrorCode;
  message: string;
  cause?: unknown;
}

export type RecordingState =
  | { status: "idle" }
  | { status: "permissionRequesting" }
  | { status: "recording"; startedAtMs: number }
  | { status: "recorded"; audio: CapturedAudio }
  | { status: "failed"; error: RecordingError };

export type RecordingAction =
  | { type: "requestPermission" }
  | { type: "recordingStarted"; startedAtMs: number }
  | { type: "recordingCaptured"; audio: CapturedAudio }
  | { type: "recordingDiscarded" }
  | { type: "recordingFailed"; error: RecordingError }
  | { type: "retry" };
```

- [ ] **Step 4: Implement reducer**

```typescript
import type { RecordingAction, RecordingState } from "./types";

export const createInitialRecordingState = (): RecordingState => ({ status: "idle" });

export const recordingReducer = (
  state: RecordingState,
  action: RecordingAction,
): RecordingState => {
  switch (action.type) {
    case "requestPermission":
      return state.status === "idle" ? { status: "permissionRequesting" } : state;
    case "recordingStarted":
      return state.status === "permissionRequesting"
        ? { status: "recording", startedAtMs: action.startedAtMs }
        : state;
    case "recordingCaptured":
      return state.status === "recording" ? { status: "recorded", audio: action.audio } : state;
    case "recordingDiscarded":
      return state.status === "recording" ? { status: "idle" } : state;
    case "recordingFailed":
      return state.status === "permissionRequesting" || state.status === "recording"
        ? { status: "failed", error: action.error }
        : state;
    case "retry":
      return state.status === "recorded" || state.status === "failed" ? { status: "idle" } : state;
  }
};
```

- [ ] **Step 5: Export recording model**

```typescript
export { createInitialRecordingState, recordingReducer } from "./reducer";
export type {
  CapturedAudio,
  RecordingAction,
  RecordingError,
  RecordingErrorCode,
  RecordingState,
  SupportedAudioExtension,
  SupportedAudioMimeType,
} from "./types";
```

- [ ] **Step 6: Run the reducer test to verify it passes**

Run: `npm test -- src/shared/model/recording/__tests__/reducer.test.ts --runInBand`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/shared/model/recording
git commit -m "feat: add recording state model"
```

## Task 2: Audio Format and Error Mapping

**Files:**

- Create: `src/shared/lib/audio/types.ts`
- Create: `src/shared/lib/audio/config.ts`
- Create: `src/shared/lib/audio/format.ts`
- Create: `src/shared/lib/audio/errors.ts`
- Create: `src/shared/lib/audio/index.ts`
- Test: `src/shared/lib/audio/__tests__/format.test.ts`
- Test: `src/shared/lib/audio/__tests__/errors.test.ts`

- [ ] **Step 1: Write failing format tests**

```typescript
import { chooseSupportedAudioFormat } from "@/shared/lib/audio";

describe("chooseSupportedAudioFormat", () => {
  it("chooses opus webm first when supported", () => {
    const isTypeSupported = jest.fn((mimeType: string) => mimeType === "audio/webm;codecs=opus");
    expect(chooseSupportedAudioFormat(isTypeSupported)).toEqual({
      mimeType: "audio/webm;codecs=opus",
      extension: "webm",
    });
  });

  it("falls back to mp4 for iOS Safari style support", () => {
    const isTypeSupported = jest.fn((mimeType: string) => mimeType === "audio/mp4");
    expect(chooseSupportedAudioFormat(isTypeSupported)).toEqual({
      mimeType: "audio/mp4",
      extension: "mp4",
    });
  });

  it("returns null when no configured format is supported", () => {
    expect(chooseSupportedAudioFormat(() => false)).toBeNull();
  });
});
```

- [ ] **Step 2: Write failing error mapping tests**

```typescript
import { mapAudioCaptureError } from "@/shared/lib/audio";

describe("mapAudioCaptureError", () => {
  it("maps permission errors", () => {
    expect(mapAudioCaptureError(new DOMException("denied", "NotAllowedError"))).toMatchObject({
      code: "permission-denied",
    });
  });

  it("maps missing device errors", () => {
    expect(mapAudioCaptureError(new DOMException("missing", "NotFoundError"))).toMatchObject({
      code: "device-not-found",
    });
  });

  it("maps unknown errors to recorder-failed", () => {
    expect(mapAudioCaptureError(new Error("boom"))).toMatchObject({
      code: "recorder-failed",
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- src/shared/lib/audio/__tests__/format.test.ts src/shared/lib/audio/__tests__/errors.test.ts --runInBand`

Expected: FAIL because `@/shared/lib/audio` does not exist.

- [ ] **Step 4: Implement audio config and types**

```typescript
import type { SupportedAudioExtension, SupportedAudioMimeType } from "@/shared/model/recording";

export interface AudioFormat {
  mimeType: SupportedAudioMimeType;
  extension: SupportedAudioExtension;
}

export type AudioTypeSupportChecker = (mimeType: string) => boolean;

export interface AudioClock {
  now: () => number;
}

export const MIN_RECORDING_DURATION_MS = 800;

export const SUPPORTED_AUDIO_FORMATS: readonly AudioFormat[] = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/mp4", extension: "mp4" },
  { mimeType: "audio/aac", extension: "aac" },
] as const;
```

- [ ] **Step 5: Implement format selection**

```typescript
import { SUPPORTED_AUDIO_FORMATS } from "./config";
import type { AudioFormat, AudioTypeSupportChecker } from "./types";

export const chooseSupportedAudioFormat = (
  isTypeSupported: AudioTypeSupportChecker,
): AudioFormat | null => {
  return SUPPORTED_AUDIO_FORMATS.find((format) => isTypeSupported(format.mimeType)) ?? null;
};
```

- [ ] **Step 6: Implement error mapping**

```typescript
import type { RecordingError } from "@/shared/model/recording";

export const createRecordingError = (
  code: RecordingError["code"],
  message: string,
  cause?: unknown,
): RecordingError => ({
  code,
  message,
  cause,
});

export const mapAudioCaptureError = (cause: unknown): RecordingError => {
  if (cause instanceof DOMException && cause.name === "NotAllowedError") {
    return createRecordingError("permission-denied", "Microphone permission was denied.", cause);
  }

  if (cause instanceof DOMException && cause.name === "NotFoundError") {
    return createRecordingError("device-not-found", "No microphone input device was found.", cause);
  }

  return createRecordingError("recorder-failed", "Audio recording failed.", cause);
};
```

- [ ] **Step 7: Export audio helpers**

```typescript
export { MIN_RECORDING_DURATION_MS, SUPPORTED_AUDIO_FORMATS } from "./config";
export { createRecordingError, mapAudioCaptureError } from "./errors";
export { chooseSupportedAudioFormat } from "./format";
export type { AudioClock, AudioFormat, AudioTypeSupportChecker } from "./types";
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- src/shared/lib/audio/__tests__/format.test.ts src/shared/lib/audio/__tests__/errors.test.ts --runInBand`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/shared/lib/audio
git commit -m "feat: add audio format detection"
```

## Task 3: Audio Capture Class

**Files:**

- Create: `src/shared/lib/audio/AudioCapture.ts`
- Modify: `src/shared/lib/audio/types.ts`
- Modify: `src/shared/lib/audio/index.ts`
- Test: `src/shared/lib/audio/__tests__/AudioCapture.test.ts`

- [ ] **Step 1: Write failing AudioCapture tests**

```typescript
import { AudioCapture, type AudioRecorderLike } from "@/shared/lib/audio";

class FakeMediaRecorder extends EventTarget implements AudioRecorderLike {
  public state: RecordingState = "inactive";
  public ondataavailable: ((event: BlobEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onstop: (() => void) | null = null;

  public start = jest.fn(() => {
    this.state = "recording";
  });

  public stop = jest.fn(() => {
    this.state = "inactive";
    this.ondataavailable?.({
      data: new Blob(["audio"], { type: "audio/webm;codecs=opus" }),
    } as BlobEvent);
    this.onstop?.();
  });
}

const createStream = () => {
  const stop = jest.fn();
  return {
    stream: {
      getTracks: () => [{ stop }],
    } as unknown as MediaStream,
    stop,
  };
};

describe("AudioCapture", () => {
  it("captures audio and cleans up tracks on stop", async () => {
    const { stream, stop } = createStream();
    const recorder = new FakeMediaRecorder();
    const capture = new AudioCapture({
      getUserMedia: jest.fn().mockResolvedValue(stream),
      createRecorder: jest.fn(() => recorder),
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: { now: jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(1000) },
    });

    await capture.start();
    const audio = await capture.stop();

    expect(audio).toMatchObject({
      mimeType: "audio/webm;codecs=opus",
      extension: "webm",
      durationMs: 1000,
    });
    expect(audio?.blob.type).toBe("audio/webm;codecs=opus");
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("discards audio shorter than 800ms and cleans up tracks", async () => {
    const { stream, stop } = createStream();
    const recorder = new FakeMediaRecorder();
    const capture = new AudioCapture({
      getUserMedia: jest.fn().mockResolvedValue(stream),
      createRecorder: jest.fn(() => recorder),
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: { now: jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(700) },
    });

    await capture.start();
    await expect(capture.stop()).resolves.toBeNull();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("throws unsupported-format before requesting microphone", async () => {
    const getUserMedia = jest.fn();
    const capture = new AudioCapture({
      getUserMedia,
      createRecorder: jest.fn(),
      isTypeSupported: () => false,
      clock: { now: () => 0 },
    });

    await expect(capture.start()).rejects.toMatchObject({ code: "unsupported-format" });
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("cancels active recorder and cleans up tracks", async () => {
    const { stream, stop } = createStream();
    const recorder = new FakeMediaRecorder();
    const capture = new AudioCapture({
      getUserMedia: jest.fn().mockResolvedValue(stream),
      createRecorder: jest.fn(() => recorder),
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: { now: () => 0 },
    });

    await capture.start();
    capture.cancel();

    expect(recorder.stop).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run AudioCapture test to verify it fails**

Run: `npm test -- src/shared/lib/audio/__tests__/AudioCapture.test.ts --runInBand`

Expected: FAIL because `AudioCapture` does not exist.

- [ ] **Step 3: Add recorder dependency types**

```typescript
export interface AudioRecorderLike {
  state: RecordingState;
  ondataavailable: ((event: BlobEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onstop: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export type AudioRecorderFactory = (
  stream: MediaStream,
  options: MediaRecorderOptions,
) => AudioRecorderLike;

export type GetUserMedia = (constraints: MediaStreamConstraints) => Promise<MediaStream>;

export interface AudioCaptureOptions {
  getUserMedia?: GetUserMedia;
  createRecorder?: AudioRecorderFactory;
  isTypeSupported?: AudioTypeSupportChecker;
  clock?: AudioClock;
}
```

- [ ] **Step 4: Implement AudioCapture**

```typescript
import type { CapturedAudio, RecordingError } from "@/shared/model/recording";

import { MIN_RECORDING_DURATION_MS } from "./config";
import { createRecordingError, mapAudioCaptureError } from "./errors";
import { chooseSupportedAudioFormat } from "./format";
import type { AudioCaptureOptions, AudioFormat, AudioRecorderLike, GetUserMedia } from "./types";

const getBrowserMediaRecorder = (): typeof MediaRecorder | null => {
  return typeof MediaRecorder === "undefined" ? null : MediaRecorder;
};

const defaultGetUserMedia: GetUserMedia = (constraints) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(
      createRecordingError("recorder-unavailable", "Media devices are not available."),
    );
  }

  return navigator.mediaDevices.getUserMedia(constraints);
};

const cleanupStream = (stream: MediaStream | null): void => {
  stream?.getTracks().forEach((track) => track.stop());
};

export class AudioCapture {
  private readonly getUserMedia: GetUserMedia;
  private readonly createRecorder: NonNullable<AudioCaptureOptions["createRecorder"]>;
  private readonly isTypeSupported: NonNullable<AudioCaptureOptions["isTypeSupported"]>;
  private readonly clock: NonNullable<AudioCaptureOptions["clock"]>;
  private recorder: AudioRecorderLike | null = null;
  private stream: MediaStream | null = null;
  private format: AudioFormat | null = null;
  private startedAtMs = 0;
  private chunks: Blob[] = [];

  public constructor(options: AudioCaptureOptions = {}) {
    const BrowserMediaRecorder = getBrowserMediaRecorder();
    this.getUserMedia = options.getUserMedia ?? defaultGetUserMedia;
    this.createRecorder =
      options.createRecorder ??
      ((stream, recorderOptions) => {
        if (!BrowserMediaRecorder) {
          throw createRecordingError("recorder-unavailable", "MediaRecorder is not available.");
        }
        return new BrowserMediaRecorder(stream, recorderOptions);
      });
    this.isTypeSupported =
      options.isTypeSupported ??
      ((mimeType) => BrowserMediaRecorder?.isTypeSupported(mimeType) ?? false);
    this.clock = options.clock ?? { now: () => performance.now() };
  }

  public start = async (): Promise<void> => {
    const format = chooseSupportedAudioFormat(this.isTypeSupported);
    if (!format) {
      throw createRecordingError(
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
    } catch (cause) {
      cleanupStream(this.stream);
      this.reset();
      throw this.normalizeError(cause);
    }
  };

  public stop = async (): Promise<CapturedAudio | null> => {
    if (!this.recorder || !this.format) {
      throw createRecordingError("recorder-unavailable", "No active recorder is available.");
    }

    const recorder = this.recorder;

    await new Promise<void>((resolve, reject) => {
      recorder.onerror = (event) => reject(event);
      recorder.onstop = () => resolve();
      if (recorder.state !== "inactive") {
        recorder.stop();
      } else {
        resolve();
      }
    });

    const durationMs = this.clock.now() - this.startedAtMs;
    const format = this.format;
    const blob = new Blob(this.chunks, { type: format.mimeType });
    cleanupStream(this.stream);
    this.reset();

    if (durationMs < MIN_RECORDING_DURATION_MS) {
      return null;
    }

    return {
      blob,
      mimeType: format.mimeType,
      extension: format.extension,
      durationMs,
    };
  };

  public cancel = (): void => {
    if (this.recorder?.state !== "inactive") {
      this.recorder?.stop();
    }
    cleanupStream(this.stream);
    this.reset();
  };

  private normalizeError = (cause: unknown): RecordingError => {
    if (typeof cause === "object" && cause !== null && "code" in cause) {
      return cause as RecordingError;
    }

    return mapAudioCaptureError(cause);
  };

  private reset = (): void => {
    this.recorder = null;
    this.stream = null;
    this.format = null;
    this.startedAtMs = 0;
    this.chunks = [];
  };
}
```

- [ ] **Step 5: Export AudioCapture**

```typescript
export { AudioCapture } from "./AudioCapture";
export { MIN_RECORDING_DURATION_MS, SUPPORTED_AUDIO_FORMATS } from "./config";
export { createRecordingError, mapAudioCaptureError } from "./errors";
export { chooseSupportedAudioFormat } from "./format";
export type {
  AudioCaptureOptions,
  AudioClock,
  AudioFormat,
  AudioRecorderFactory,
  AudioRecorderLike,
  AudioTypeSupportChecker,
  GetUserMedia,
} from "./types";
```

- [ ] **Step 6: Run AudioCapture test to verify it passes**

Run: `npm test -- src/shared/lib/audio/__tests__/AudioCapture.test.ts --runInBand`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/shared/lib/audio
git commit -m "feat: add headless audio capture"
```

## Task 4: Full Verification

**Files:**

- Verify all files created in Tasks 1-3.

- [ ] **Step 1: Run all audio and recording tests**

Run: `npm test -- src/shared/model/recording src/shared/lib/audio --runInBand`

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run: `npm test -- --runInBand`

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 5: Run format check**

Run: `npm run format:check`

Expected: PASS.

- [ ] **Step 6: Inspect final diff**

Run: `git diff --stat main...HEAD`

Expected: only docs and `src/shared/model/recording`, `src/shared/lib/audio` files are included.

- [ ] **Step 7: Commit final cleanup if needed**

If formatting or small test fixes changed files, run:

```bash
git add src/shared/model/recording src/shared/lib/audio docs/superpowers/plans/2026-06-24-audio-capture-recording-state.md
git commit -m "test: verify audio capture module"
```

If no files changed, do not create an empty commit.
