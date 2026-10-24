import { afterEach, expect, jest, test } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { GrammarAudioButton } from "@/features/grammar-audio";
import type { GrammarAudioResult } from "@/features/grammar-audio";

const input = { noteId: "note", sentenceId: "example", noteVersion: 1 };
const originalAudio = globalThis.Audio;
afterEach(() => {
  globalThis.Audio = originalAudio;
});

test("loading animates until playback starts; waveform stops when playback ends", async () => {
  let finish!: (result: GrammarAudioResult) => void;
  const generate = jest.fn(
    () =>
      new Promise<GrammarAudioResult>((resolve) => {
        finish = resolve;
      }),
  );
  const player = {
    play: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    pause: jest.fn(),
    onended: null as (() => void) | null,
    onerror: null,
  };
  globalThis.Audio = jest.fn(() => player) as unknown as typeof Audio;
  const { container } = render(<GrammarAudioButton input={input} generate={generate} />);
  fireEvent.click(screen.getByRole("button", { name: "문장 듣기" }));
  const loading = screen.getByRole("button", { name: "음성 불러오는 중…" });
  expect(loading).toBeDisabled();
  expect(loading).toHaveAttribute("aria-busy", "true");
  expect(loading.querySelector("svg")).toHaveClass("animate-spin");
  fireEvent.click(loading);
  expect(generate).toHaveBeenCalledTimes(1);
  expect(container.querySelector(".echo-audio-wave")).toBeNull();
  await act(async () => {
    finish({ ok: true, audioBase64: "audio", mimeType: "audio/mpeg", cacheKey: "key" });
  });
  expect(screen.getByRole("button", { name: "재생 중지" })).toBeEnabled();
  expect(container.querySelector(".echo-audio-wave")).toBeInTheDocument();
  act(() => {
    player.onended?.();
  });
  expect(screen.getByRole("button", { name: "문장 듣기" })).toBeEnabled();
  expect(container.querySelector(".echo-audio-wave")).toBeNull();
});

test("failed loading clears the spinner and offers a retry", async () => {
  const generate = jest.fn(async () => ({
    ok: false as const,
    code: "GENERATION_FAILED" as const,
  }));
  render(<GrammarAudioButton input={input} generate={generate} />);
  fireEvent.click(screen.getByRole("button", { name: "문장 듣기" }));
  const retry = await screen.findByRole("button", { name: "음성 다시 불러오기" });
  expect(retry).toBeEnabled();
  expect(retry.querySelector('[data-slot="spinner"]')).toBeNull();
  expect(screen.getByRole("alert")).toHaveTextContent("준비된 음성을 불러오지 못했습니다");
});
