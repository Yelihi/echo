import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import type { RecordingPhase } from "@/views/recording/models/interface";
import { usePartnerAudioPlayback } from "@/views/recording/services/hooks/usePartnerAudioPlayback";

class FakeAudio {
  src = "";
  currentTime = 0;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = jest.fn<() => Promise<void>>(async () => undefined);
  pause = jest.fn();
}

const audioInstances: FakeAudio[] = [];

function renderPartnerHook(callbacks = { onSucceeded: jest.fn(), onFailed: jest.fn() }) {
  const loadPartnerAudio = jest.fn(async () => new Blob([new Uint8Array([1, 2, 3])]));
  const hook = renderHook((phase: RecordingPhase = "partner-speaking") =>
    usePartnerAudioPlayback({
      phase,
      sessionId: "session-1",
      partnerLine: "Hello",
      autoAdvancePartner: true,
      loadPartnerAudio,
      ...callbacks,
    }),
  );

  return { ...hook, loadPartnerAudio };
}

describe("usePartnerAudioPlayback", () => {
  const createObjectURL = jest.fn(() => "blob:partner");
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    audioInstances.length = 0;
    global.Audio = jest.fn(() => {
      const audio = new FakeAudio();
      audioInstances.push(audio);
      return audio as unknown as HTMLAudioElement;
    }) as unknown as typeof Audio;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("marks partner playback succeeded after audio playback finishes", async () => {
    const onSucceeded = jest.fn();
    const { loadPartnerAudio } = renderPartnerHook({ onSucceeded, onFailed: jest.fn() });

    await waitFor(() => expect(loadPartnerAudio).toHaveBeenCalledTimes(1));
    act(() => audioInstances[0]?.onended?.());

    expect(onSucceeded).toHaveBeenCalledTimes(1);
  });

  it("다음 turn에서는 이전 Blob 대신 새 문장의 오디오를 재생한다", async () => {
    const first = new Blob(["first"]);
    const second = new Blob(["second"]);
    const loaders = [jest.fn(async () => first), jest.fn(async () => second)];
    const onSucceeded = jest.fn();
    const onFailed = jest.fn();
    const { rerender } = renderHook(
      ({ step }) =>
        usePartnerAudioPlayback({
          phase: "partner-speaking",
          sessionId: "session-1",
          partnerLine: `line-${step}`,
          autoAdvancePartner: true,
          loadPartnerAudio: loaders[step],
          onSucceeded,
          onFailed,
        }),
      { initialProps: { step: 0 } },
    );
    await waitFor(() => expect(createObjectURL).toHaveBeenLastCalledWith(first));
    rerender({ step: 1 });
    await waitFor(() => expect(createObjectURL).toHaveBeenLastCalledWith(second));
    expect(loaders[1]).toHaveBeenCalledTimes(1);
  });

  it("marks playback failed when TTS returns no audio", async () => {
    const onFailed = jest.fn();
    renderHook(() =>
      usePartnerAudioPlayback({
        phase: "partner-speaking",
        sessionId: "session-1",
        partnerLine: "Hello",
        autoAdvancePartner: true,
        loadPartnerAudio: jest.fn(async () => null),
        onSucceeded: jest.fn(),
        onFailed,
      }),
    );

    await waitFor(() => expect(onFailed).toHaveBeenCalledTimes(1));
  });

  it("marks playback failed when audio play is rejected", async () => {
    const onFailed = jest.fn();
    const { result } = renderPartnerHook({ onSucceeded: jest.fn(), onFailed });
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
    audioInstances[0]?.play.mockRejectedValueOnce(new Error("blocked"));

    await act(async () => {
      await result.current.replay();
    });

    await waitFor(() => expect(onFailed).toHaveBeenCalledTimes(1));
  });

  it("replays cached audio without another server call and revokes object urls", async () => {
    const { result, unmount, loadPartnerAudio } = renderPartnerHook();

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
    await act(async () => {
      await result.current.replay();
    });
    unmount();

    expect(loadPartnerAudio).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
  });
});
