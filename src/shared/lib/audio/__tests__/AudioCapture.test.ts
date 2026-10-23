import { describe, expect, it, jest } from "@jest/globals";

import {
  AudioCapture,
  type AudioCaptureRecorder,
  type AudioCaptureRecorderFactory,
  type GetUserMedia,
  type SupportedAudioMimeType,
} from "@/shared/lib/audio";

class FakeAudioRecorder implements AudioCaptureRecorder {
  state: RecordingState = "inactive";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;

  readonly start = jest.fn(() => {
    this.state = "recording";
  });

  readonly stop = jest.fn(() => {
    this.state = "inactive";
    this.ondataavailable?.({
      data: new Blob(["audio-data"], { type: "audio/webm;codecs=opus" }),
    } as BlobEvent);
    this.onstop?.(new Event("stop"));
  });
}

function createStream(): { stream: MediaStream; stopTrack: jest.Mock } {
  const stopTrack = jest.fn();

  return {
    stream: {
      getTracks: () => [{ stop: stopTrack }],
    } as unknown as MediaStream,
    stopTrack,
  };
}

function createGetUserMedia(stream: MediaStream): GetUserMedia {
  return () => Promise.resolve(stream);
}

function createClock(...values: number[]): { now: () => number } {
  let index = 0;

  return {
    now: () => values[index++] ?? values[values.length - 1] ?? 0,
  };
}

describe("AudioCapture", () => {
  it("records audio and cleans up stream tracks after stop", async () => {
    const { stream, stopTrack } = createStream();
    const recorder = new FakeAudioRecorder();
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => recorder,
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: createClock(100, 1150),
    });

    await capture.start();
    const audio = await capture.stop();

    expect(audio).toMatchObject({
      mimeType: "audio/webm;codecs=opus",
      extension: "webm",
      durationMs: 1050,
    });
    expect(audio.blob.type).toBe("audio/webm;codecs=opus");
    expect(audio.blob.size).toBeGreaterThan(0);
    expect(capture.getStatus()).toBe("idle");
    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  it("throws unsupported-format before requesting microphone", async () => {
    const getUserMedia = jest.fn<GetUserMedia>();
    const capture = new AudioCapture({
      getUserMedia,
      createRecorder: jest.fn<AudioCaptureRecorderFactory>(),
      isTypeSupported: () => false,
      clock: { now: () => 0 },
    });

    await expect(capture.start()).rejects.toMatchObject({
      code: "unsupported-format",
    });
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(capture.getStatus()).toBe("idle");
  });

  it("separates recorder start failures from stop failures", async () => {
    const { stream, stopTrack } = createStream();
    const recorder = new FakeAudioRecorder();
    recorder.start.mockImplementationOnce(() => {
      throw new Error("start failed");
    });
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => recorder,
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: { now: () => 0 },
    });

    await expect(capture.start()).rejects.toMatchObject({
      code: "recorder-start-failed",
    });
    expect(stopTrack).toHaveBeenCalledTimes(1);
    expect(capture.getStatus()).toBe("idle");
  });

  it("throws recorder-stop-failed when recorder stop fails", async () => {
    const { stream, stopTrack } = createStream();
    const recorder = new FakeAudioRecorder();
    recorder.stop.mockImplementationOnce(() => {
      throw new Error("stop failed");
    });
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => recorder,
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: createClock(0, 1000),
    });

    await capture.start();

    await expect(capture.stop()).rejects.toMatchObject({
      code: "recorder-stop-failed",
    });
    expect(stopTrack).toHaveBeenCalledTimes(1);
    expect(capture.getStatus()).toBe("idle");
  });

  it("throws recorder-stop-failed when recorder stop never completes", async () => {
    jest.useFakeTimers();

    class HangingAudioRecorder extends FakeAudioRecorder {
      override readonly stop = jest.fn(() => {
        this.state = "inactive";
      });
    }

    const { stream, stopTrack } = createStream();
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => new HangingAudioRecorder(),
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: createClock(0, 1000),
      stopTimeoutMs: 100,
    });

    await capture.start();
    const stopPromise = capture.stop();
    jest.advanceTimersByTime(100);

    await expect(stopPromise).rejects.toMatchObject({
      code: "recorder-stop-failed",
    });
    expect(stopTrack).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("throws empty-audio-data when stop completes without audio bytes", async () => {
    class EmptyAudioRecorder extends FakeAudioRecorder {
      override readonly stop = jest.fn(() => {
        this.state = "inactive";
        this.ondataavailable?.({
          data: new Blob([], { type: "audio/webm;codecs=opus" }),
        } as BlobEvent);
        this.onstop?.(new Event("stop"));
      });
    }

    const { stream, stopTrack } = createStream();
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => new EmptyAudioRecorder(),
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: createClock(0, 1000),
    });

    await capture.start();

    await expect(capture.stop()).rejects.toMatchObject({
      code: "empty-audio-data",
    });
    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  it("cancels active recording and cleans up stream tracks", async () => {
    const { stream, stopTrack } = createStream();
    const recorder = new FakeAudioRecorder();
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => recorder,
      isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
      clock: { now: () => 0 },
    });

    await capture.start();
    capture.cancel();

    expect(recorder.stop).toHaveBeenCalledTimes(1);
    expect(stopTrack).toHaveBeenCalledTimes(1);
    expect(capture.getStatus()).toBe("idle");
  });

  it("prevents starting while capture is already recording", async () => {
    const { stream } = createStream();
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => new FakeAudioRecorder(),
      isTypeSupported: (mimeType) =>
        mimeType === ("audio/webm;codecs=opus" satisfies SupportedAudioMimeType),
      clock: { now: () => 0 },
    });

    await capture.start();

    await expect(capture.start()).rejects.toMatchObject({
      code: "recorder-start-failed",
    });
    capture.cancel();
  });
});

describe("capture attempt boundaries", () => {
  it("freezes duration at stop request even when the last chunk arrives after the deadline", async () => {
    const { stream } = createStream();
    const recorder = new FakeAudioRecorder();
    recorder.stop.mockImplementation(() => {
      recorder.state = "inactive";
    });
    let now = 0;
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => recorder,
      isTypeSupported: () => true,
      clock: { now: () => now },
    });
    await capture.start();
    now = 59_900;
    const pending = capture.stop(60_000);
    now = 61_000;
    recorder.ondataavailable?.({ data: new Blob(["valid"]) } as BlobEvent);
    recorder.onstop?.(new Event("stop"));
    expect((await pending).durationMs).toBe(59_900);
  });

  it("rejects a stop exactly at the limit and releases the microphone", async () => {
    const { stream, stopTrack } = createStream();
    const recorder = new FakeAudioRecorder();
    const capture = new AudioCapture({
      getUserMedia: createGetUserMedia(stream),
      createRecorder: () => recorder,
      isTypeSupported: () => true,
      clock: createClock(0, 60_000),
    });
    await capture.start();
    await expect(capture.stop(60_000)).rejects.toMatchObject({ code: "duration-limit-exceeded" });
    expect(stopTrack).toHaveBeenCalledTimes(1);
    expect(capture.getStatus()).toBe("idle");
  });

  it("ignores canceled recorder chunks and completion while a new attempt is recording", async () => {
    const old = new FakeAudioRecorder();
    old.stop.mockImplementation(() => {
      old.state = "inactive";
    });
    const next = new FakeAudioRecorder();
    const firstStream = createStream();
    const nextStream = createStream();
    let attempt = 0;
    let now = 0;
    const capture = new AudioCapture({
      getUserMedia: async () => (attempt === 0 ? firstStream.stream : nextStream.stream),
      createRecorder: () => (attempt++ === 0 ? old : next),
      isTypeSupported: () => true,
      clock: { now: () => now },
    });
    await capture.start();
    const lateData = old.ondataavailable;
    now = 1000;
    const pending = capture.stop();
    capture.cancel();
    await capture.start();
    lateData?.({ data: new Blob(["stale"]) } as BlobEvent);
    old.onstop?.(new Event("stop"));
    await expect(pending).rejects.toMatchObject({ code: "recorder-stop-failed" });
    expect(capture.getStatus()).toBe("recording");
    expect(nextStream.stopTrack).not.toHaveBeenCalled();
    now = 2000;
    const audio = await capture.stop();
    expect(audio.blob.size).toBe(new Blob(["audio-data"]).size);
    expect(audio.durationMs).toBe(1000);
  });
});

it("releases a late permission result without replacing the next capture", async () => {
  let grantOld!: (stream: MediaStream) => void;
  const oldStream = createStream();
  const nextStream = createStream();
  const recorder = new FakeAudioRecorder();
  const getUserMedia = jest
    .fn<GetUserMedia>()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          grantOld = resolve;
        }),
    )
    .mockResolvedValueOnce(nextStream.stream);
  const createRecorder = jest.fn(() => recorder);
  const capture = new AudioCapture({ getUserMedia, createRecorder, isTypeSupported: () => true });
  const oldStart = capture.start();
  capture.cancel();
  await capture.start();
  grantOld(oldStream.stream);
  expect(await oldStart).toBeNull();
  expect(oldStream.stopTrack).toHaveBeenCalledTimes(1);
  expect(nextStream.stopTrack).not.toHaveBeenCalled();
  expect(createRecorder).toHaveBeenCalledTimes(1);
  expect(capture.getStatus()).toBe("recording");
  capture.cancel();
});
