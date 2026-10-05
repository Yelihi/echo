import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useGrammarAudio } from "@/features/grammar-audio/services/useGrammarAudio";
import type { GrammarAudioResult } from "@/features/grammar-audio";
const input = { noteId: "note", sentenceId: "source", noteVersion: 1 };
const speech = {
  ok: true as const,
  audioBase64: "audio",
  mimeType: "audio/mpeg" as const,
  cacheKey: "key",
};
const originalAudio = globalThis.Audio;
describe("grammar audio lifecycle", () => {
  const play = jest.fn<() => Promise<void>>();
  const pause = jest.fn();
  beforeEach(() => {
    play.mockReset().mockResolvedValue();
    pause.mockReset();
    globalThis.Audio = jest.fn(() => ({
      play,
      pause,
      onended: null,
      onerror: null,
    })) as unknown as typeof Audio;
  });
  afterEach(() => {
    globalThis.Audio = originalAudio;
  });
  it("retries playback using generated audio without another generation", async () => {
    play.mockRejectedValueOnce(new Error("blocked"));
    const generate = jest.fn<() => Promise<GrammarAudioResult>>().mockResolvedValue(speech);
    const { result } = renderHook(() => useGrammarAudio({ input, generate }));
    await act(() => result.current.play());
    expect(result.current.status).toBe("playback-error");
    await act(() => result.current.play());
    expect(result.current.status).toBe("playing");
    expect(generate).toHaveBeenCalledTimes(1);
  });
  it("invalidates audio after a saved note version change", async () => {
    const generate = jest.fn<() => Promise<GrammarAudioResult>>().mockResolvedValue(speech);
    const { result, rerender } = renderHook(
      ({ version }) => useGrammarAudio({ input: { ...input, noteVersion: version }, generate }),
      { initialProps: { version: 1 } },
    );
    await act(() => result.current.play());
    rerender({ version: 2 });
    expect(pause).toHaveBeenCalled();
    await act(() => result.current.play());
    expect(generate).toHaveBeenCalledTimes(2);
  });
  it("ignores generation that finishes after unmount", async () => {
    let resolve!: (value: GrammarAudioResult) => void;
    const generate = () =>
      new Promise<GrammarAudioResult>((done) => {
        resolve = done;
      });
    const { result, unmount } = renderHook(() => useGrammarAudio({ input, generate }));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.play();
    });
    unmount();
    await act(async () => {
      resolve(speech);
      await pending;
    });
    expect(play).not.toHaveBeenCalled();
  });
  it("retries generation failure rather than treating it as playback failure", async () => {
    const generate = jest
      .fn<() => Promise<GrammarAudioResult>>()
      .mockResolvedValueOnce({ ok: false, message: "failed" })
      .mockResolvedValueOnce(speech);
    const { result } = renderHook(() => useGrammarAudio({ input, generate }));
    await act(() => result.current.play());
    expect(result.current.status).toBe("generation-error");
    await act(() => result.current.play());
    expect(result.current.status).toBe("playing");
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
