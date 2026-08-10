import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";

import { useRecordingSession } from "@/features/session-recording";
import type { AudioCaptureOptions, AudioCaptureRecorder } from "@/shared/lib/audio";

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
    expect(recorderStop).toHaveBeenCalledTimes(1);
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
    const options: AudioCaptureOptions = {
      getUserMedia: jest.fn(async () => {
        throw new DOMException("denied", "NotAllowedError");
      }),
      isTypeSupported: () => true,
    };
    const { result } = renderHook(() => useRecordingSession({ audioCaptureOptions: options }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toEqual({
      status: "failed",
      errorCode: "permission-denied",
    });
  });
});
