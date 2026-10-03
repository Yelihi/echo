import { beforeEach, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useStore } from "zustand";
import { createMemorizationRecordingSessionStore } from "../../../models/stores/memorizationRecordingSessionStore";
import type { CapturedAudio } from "@/shared/lib/audio";

jest.mock("@/features/session-recording", () => ({ useRecordingSession: jest.fn() }));
jest.mock("../../showRecordingError", () => ({ showRecordingError: jest.fn() }));
const reset = jest.fn();
const audio: CapturedAudio = {
  blob: new Blob(["recording"]),
  durationMs: 1000,
  mimeType: "audio/webm",
  extension: "webm",
};

beforeEach(async () => {
  jest.clearAllMocks();
  const { useRecordingSession } = await import("@/features/session-recording");
  jest.mocked(useRecordingSession).mockReturnValue({
    state: { status: "recorded" },
    recordedAudio: audio,
    retry: reset,
  } as never);
});

it("저장 어댑터가 없으면 녹음을 유지하고 완료로 진행하지 않는다", async () => {
  const { useRecordingTurn } = await import("../useRecordingTurn");
  const { showRecordingError } = await import("../../showRecordingError");
  const store = createMemorizationRecordingSessionStore({
    initialPhase: "recorded",
    activeStep: 1,
    totalSteps: 1,
    demoDurationMs: 1000,
  });
  const { result } = renderHook(() =>
    useRecordingTurn({
      store: useStore(store),
      totalSteps: 1,
      demoDurationMs: 1000,
      nextPhase: "user-ready",
    }),
  );
  await act(async () => {
    await result.current.save();
  });
  expect(reset).not.toHaveBeenCalled();
  expect(result.current.recordedAudio).toBe(audio);
  expect(store.getState()).toMatchObject({
    phase: "recorded",
    currentStep: 1,
    saveFailed: true,
    saving: false,
  });
  expect(showRecordingError).toHaveBeenCalledWith(
    expect.objectContaining({ code: "RECORDING_SERVER_NOT_READY" }),
  );
});
