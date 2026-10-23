import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { randomUUID } from "node:crypto";
import { useStore } from "zustand";
import { createMemorizationRecordingSessionStore } from "../../../models/stores/memorizationRecordingSessionStore";
import { useRecordingTurn } from "../useRecordingTurn";
import type { AudioCaptureRecorder, CapturedAudio } from "@/shared/lib/audio";
import { MEMORIZATION_RECORDING_LIMIT_MS } from "@/features/memorization-sessions/config/recording";

class BrowserRecorder implements AudioCaptureRecorder {
  static isTypeSupported = () => true;
  state: RecordingState = "inactive";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["valid recording"]) } as BlobEvent);
    this.onstop?.(new Event("stop"));
  }
}

const descriptors = {
  media: Object.getOwnPropertyDescriptor(navigator, "mediaDevices"),
  recorder: Object.getOwnPropertyDescriptor(globalThis, "MediaRecorder"),
  uuid: Object.getOwnPropertyDescriptor(crypto, "randomUUID"),
};
const stopTrack = jest.fn();
const getUserMedia = jest.fn<() => Promise<MediaStream>>();

beforeEach(() => {
  jest.useFakeTimers();
  stopTrack.mockClear();
  getUserMedia
    .mockReset()
    .mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream);
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: BrowserRecorder,
  });
  Object.defineProperty(crypto, "randomUUID", { configurable: true, value: randomUUID });
});
afterEach(() => {
  jest.useRealTimers();
  for (const [target, key, descriptor] of [
    [navigator, "mediaDevices", descriptors.media],
    [globalThis, "MediaRecorder", descriptors.recorder],
    [crypto, "randomUUID", descriptors.uuid],
  ] as const) {
    if (descriptor) Object.defineProperty(target, key, descriptor);
    else Reflect.deleteProperty(target, key);
  }
});

function setup(limit: number | undefined = MEMORIZATION_RECORDING_LIMIT_MS) {
  const saveRecording = jest.fn<(audio: CapturedAudio) => Promise<void>>().mockResolvedValue();
  const store = createMemorizationRecordingSessionStore({
    initialPhase: "user-ready",
    activeStep: 1,
    totalSteps: 2,
    demoDurationMs: 1000,
  });
  const hook = renderHook(() =>
    useRecordingTurn({
      store: useStore(store),
      totalSteps: 2,
      demoDurationMs: 1000,
      nextPhase: "user-ready",
      saveRecording,
      maxDurationMs: limit,
    }),
  );
  return { ...hook, store, saveRecording };
}

async function toggle(h: ReturnType<typeof setup>) {
  await act(async () => {
    await h.result.current.toggle();
  });
}

describe("문단 녹음 제한의 화면·저장 경계", () => {
  it("권한 대기에는 01:00을 유지하고 시작 실패를 녹음 중으로 덮지 않는다", async () => {
    let reject!: (error: Error) => void;
    getUserMedia.mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    const h = setup();
    let pending!: Promise<void>;
    act(() => {
      pending = h.result.current.toggle();
    });
    act(() => jest.advanceTimersByTime(30_000));
    expect(h.result.current.durationLabel).toBe("남은 시간 01:00");
    expect(h.store.getState().phase).toBe("user-ready");
    await act(async () => {
      reject(new DOMException("denied", "NotAllowedError"));
      await pending;
    });
    expect(h.result.current.phase).toBe("failed");
    expect(h.store.getState().phase).toBe("user-ready");
    h.unmount();
  });

  it("타이머 만료 시 녹음을 폐기하고 저장·다음 문단 진행을 막으며 다시 60초로 시작한다", async () => {
    const h = setup();
    await toggle(h);
    act(() => jest.advanceTimersByTime(250));
    expect(h.result.current.durationLabel).toBe("남은 시간 01:00");
    act(() => jest.advanceTimersByTime(59_750));
    expect(h.result.current.timedOut).toBe(true);
    expect(h.result.current.durationLabel).toBe("남은 시간 00:00");
    expect(h.result.current.recordedAudio).toBeNull();
    expect(stopTrack).toHaveBeenCalledTimes(1);
    await act(async () => {
      await h.result.current.save();
    });
    expect(h.saveRecording).not.toHaveBeenCalled();
    expect(h.store.getState().currentStep).toBe(1);
    await toggle(h);
    expect(h.result.current.phase).toBe("recording");
    expect(h.result.current.durationLabel).toBe("남은 시간 01:00");
    h.unmount();
  });

  it("저장된 첫 문단은 유지하고 두 번째 문단의 초과 시도만 폐기한다", async () => {
    const h = setup();
    await toggle(h);
    act(() => jest.advanceTimersByTime(1000));
    await toggle(h);
    const first = h.result.current.recordedAudio;
    await act(async () => {
      await h.result.current.save();
    });
    expect(h.saveRecording).toHaveBeenCalledWith(first);
    expect(h.store.getState().currentStep).toBe(2);
    await toggle(h);
    act(() => jest.advanceTimersByTime(60_000));
    await act(async () => {
      await h.result.current.save();
    });
    expect(h.saveRecording).toHaveBeenCalledTimes(1);
    expect(h.store.getState().currentStep).toBe(2);
    expect(h.result.current.recordedAudio).toBeNull();
    h.unmount();
  });

  it("시간 내 녹음은 대기·저장 실패 후에도 보존하고 저장만 재시도한다", async () => {
    const h = setup();
    h.saveRecording.mockRejectedValueOnce(new Error("offline"));
    await toggle(h);
    act(() => jest.advanceTimersByTime(59_900));
    await toggle(h);
    const audio = h.result.current.recordedAudio;
    act(() => jest.advanceTimersByTime(120_000));
    await act(async () => {
      await h.result.current.save();
    });
    expect(h.result.current.recordedAudio).toBe(audio);
    expect(h.result.current.phase).toBe("recorded");
    expect(h.store.getState().currentStep).toBe(1);
    await act(async () => {
      await h.result.current.save();
    });
    expect(h.saveRecording).toHaveBeenNthCalledWith(2, audio);
    expect(h.store.getState().currentStep).toBe(2);
    h.unmount();
  });
});
