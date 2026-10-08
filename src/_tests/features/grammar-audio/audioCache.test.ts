/** @jest-environment node */
import { describe, it, expect, jest } from "@jest/globals";
jest.mock("server-only", () => ({}));
describe("grammar audio content cache", () => {
  it("isolates owner and invalidates text or model changes", async () => {
    const { grammarAudioCacheKey: key } =
      await import("@/features/grammar-audio/services/audioCache");
    const original = key("owner", "sentence", "model");
    expect(key("other", "sentence", "model")).not.toBe(original);
    expect(key("owner", "edited", "model")).not.toBe(original);
    expect(key("owner", "sentence", "new-model")).not.toBe(original);
  });
  it("deduplicates concurrent generation and does not cache failure", async () => {
    const { cachedGrammarAudio } = await import("@/features/grammar-audio/services/audioCache");
    const generate = jest.fn(async () => ({
      ok: false as const,
      code: "GENERATION_FAILED" as const,
    }));
    await Promise.all([
      cachedGrammarAudio("unique", generate),
      cachedGrammarAudio("unique", generate),
    ]);
    expect(generate).toHaveBeenCalledTimes(1);
    await cachedGrammarAudio("unique", generate);
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
