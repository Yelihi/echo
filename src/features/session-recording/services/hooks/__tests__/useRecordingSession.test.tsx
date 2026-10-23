import { act, renderHook } from "@testing-library/react";
import { beforeAll, afterAll, describe, expect, it, jest } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { useRecordingSession } from "@/features/session-recording";
import type { AudioCaptureOptions, AudioCaptureRecorder } from "@/shared/lib/audio";
import { createOperationEventRecorder } from "@/shared/lib/logging/testing";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

function createRecorder(): AudioCaptureRecorder {
  return {
    state: "inactive",
    ondataavailable: null,
    onerror: null,
    onstop: null,
    start() {
      Object.defineProperty(this, "state", { value: "recording", configurable: true });
    },
    stop() {
      Object.defineProperty(this, "state", { value: "inactive", configurable: true });
    },
  };
}

function createAudioOptions(
  stream: MediaStream,
  recorder: AudioCaptureRecorder = createRecorder(),
): AudioCaptureOptions {
  return {
    getUserMedia: jest.fn(async () => stream),
    createRecorder: jest.fn(() => recorder),
    isTypeSupported: () => true,
  };
}

describe("useRecordingSession", () => {
  const originalUuid = Object.getOwnPropertyDescriptor(crypto, "randomUUID");
  beforeAll(() => {
    Object.defineProperty(crypto, "randomUUID", { configurable: true, value: randomUUID });
  });
  afterAll(() => {
    if (originalUuid) Object.defineProperty(crypto, "randomUUID", originalUuid);
    else Reflect.deleteProperty(crypto, "randomUUID");
  });
  it("cancels a recorder that starts after the user already cancelled", async () => {
    const pendingStream = deferred<MediaStream>();
    const trackStop = jest.fn();
    const recorder = createRecorder();
    const recorderStop = jest.spyOn(recorder, "stop");
    const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
    const options: AudioCaptureOptions = {
      getUserMedia: jest.fn(() => pendingStream.promise),
      createRecorder: jest.fn(() => recorder),
      isTypeSupported: () => true,
    };
    const { result } = renderHook(() => useRecordingSession({ audioCaptureOptions: options }));

    await act(async () => {
      const startPromise = result.current.start();
      result.current.cancel();
      pendingStream.resolve(stream);
      await startPromise;
    });

    expect(result.current.state).toEqual({ status: "idle" });
    expect(recorderStop).not.toHaveBeenCalled();
    expect(options.createRecorder).not.toHaveBeenCalled();
    expect(trackStop).toHaveBeenCalledTimes(1);
  });

  it("releases the active microphone stream on unmount", async () => {
    const trackStop = jest.fn();
    const recorder = createRecorder();
    const recorderStop = jest.spyOn(recorder, "stop");
    const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
    const { result, unmount } = renderHook(() =>
      useRecordingSession({ audioCaptureOptions: createAudioOptions(stream, recorder) }),
    );

    await act(async () => {
      await result.current.start();
    });
    unmount();

    expect(recorderStop).toHaveBeenCalledTimes(1);
    expect(trackStop).toHaveBeenCalledTimes(1);
  });

  it("stores stable error codes for known audio errors", async () => {
    const events = createOperationEventRecorder({ print: process.env.TEST_LOGS === "1" });
    const options: AudioCaptureOptions = {
      getUserMedia: jest.fn(async () => {
        throw new DOMException("denied", "NotAllowedError");
      }),
      isTypeSupported: () => true,
    };
    const { result } = renderHook(() =>
      useRecordingSession({ audioCaptureOptions: options, recordEvent: events.recordEvent }),
    );

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toEqual({
      status: "failed",
      errorCode: "permission-denied",
    });
    expect(events.events.map((event) => event.phase)).toEqual(["started", "failed"]);
  });
});

describe("recording deadline", () => {
  const originalUuid = Object.getOwnPropertyDescriptor(crypto, "randomUUID");
  beforeAll(() => {
    Object.defineProperty(crypto, "randomUUID", { configurable: true, value: randomUUID });
  });
  afterAll(() => {
    if (originalUuid) Object.defineProperty(crypto, "randomUUID", originalUuid);
    else Reflect.deleteProperty(crypto, "randomUUID");
  });

  function setup(limit: number | null = 60_000) {
    let now = 0;
    const trackStop = jest.fn();
    const recorder = createRecorder();
    const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
    const options = { ...createAudioOptions(stream, recorder), clock: { now: () => now } };
    const hook = renderHook(() =>
      useRecordingSession({ audioCaptureOptions: options, maxDurationMs: limit ?? undefined }),
    );
    return {
      ...hook,
      recorder,
      trackStop,
      setNow: (value: number) => {
        now = value;
      },
      finish: () => {
        recorder.ondataavailable?.({ data: new Blob(["audio"]) } as BlobEvent);
        recorder.onstop?.(new Event("stop"));
      },
    };
  }

  it("starts the deadline after microphone permission is granted", async () => {
    const pending = deferred<MediaStream>();
    let now = 0;
    const recorder = createRecorder();
    const options: AudioCaptureOptions = {
      getUserMedia: () => pending.promise,
      createRecorder: () => recorder,
      isTypeSupported: () => true,
      clock: { now: () => now },
    };
    const { result } = renderHook(() =>
      useRecordingSession({ audioCaptureOptions: options, maxDurationMs: 60_000 }),
    );
    let start!: ReturnType<typeof result.current.start>;
    act(() => {
      start = result.current.start();
    });
    expect(result.current.state.status).toBe("starting");
    now = 30_000;
    await act(async () => {
      pending.resolve({ getTracks: () => [{ stop: jest.fn() }] } as unknown as MediaStream);
      await start;
    });
    expect(result.current.state).toEqual({ status: "recording", startedAtMs: 30_000 });
    expect(result.current.elapsedMs).toBe(0);
    act(() => result.current.cancel());
  });

  it.each([60_000, 75_000])(
    "discards at %i ms even if timer callbacks were suspended",
    async (elapsed) => {
      const h = setup();
      await act(async () => {
        await h.result.current.start();
      });
      h.setNow(elapsed);
      await act(async () => {
        expect(await h.result.current.stop()).toBe("discarded");
      });
      expect(h.result.current.state).toEqual({ status: "discarded", reason: "timeout" });
      expect(h.result.current.recordedAudio).toBeNull();
      expect(h.trackStop).toHaveBeenCalledTimes(1);
    },
  );

  it("discards on return to the page without needing a stop click", async () => {
    const h = setup();
    await act(async () => {
      await h.result.current.start();
    });
    h.setNow(80_000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(h.result.current.state).toEqual({ status: "discarded", reason: "timeout" });
    expect(h.trackStop).toHaveBeenCalledTimes(1);
  });

  it("keeps a timely stop valid while final data arrives after 60 seconds", async () => {
    const h = setup();
    await act(async () => {
      await h.result.current.start();
    });
    h.setNow(59_900);
    let stop!: ReturnType<typeof h.result.current.stop>;
    act(() => {
      stop = h.result.current.stop();
    });
    h.setNow(65_000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await act(async () => {
      h.finish();
      expect(await stop).toBe("recorded");
    });
    expect(h.result.current.recordedAudio?.durationMs).toBe(59_900);
  });

  it("ignores canceled stop completion after a new recording has started", async () => {
    const h = setup();
    await act(async () => {
      await h.result.current.start();
    });
    h.setNow(1000);
    let stop!: ReturnType<typeof h.result.current.stop>;
    act(() => {
      stop = h.result.current.stop();
    });
    const oldStop = h.recorder.onstop;
    act(() => h.result.current.retry());
    await act(async () => {
      await h.result.current.start();
    });
    await act(async () => {
      oldStop?.(new Event("stop"));
      expect(await stop).toBe("canceled");
    });
    expect(h.result.current.state.status).toBe("recording");
    expect(h.result.current.recordedAudio).toBeNull();
    act(() => h.result.current.cancel());
  });

  it("does not impose the memorization deadline when no limit was supplied", async () => {
    const h = setup(null);
    await act(async () => {
      await h.result.current.start();
    });
    h.setNow(90_000);
    let stop!: ReturnType<typeof h.result.current.stop>;
    act(() => {
      stop = h.result.current.stop();
    });
    await act(async () => {
      h.finish();
      expect(await stop).toBe("recorded");
    });
    expect(h.result.current.recordedAudio?.durationMs).toBe(90_000);
  });
});
