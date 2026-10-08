import { describe, it, expect, jest } from "@jest/globals";
import type { GrammarNote } from "@/entities/grammar-note";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { resolveGrammarAudioText } from "@/features/grammar-audio/services/resolveGrammarAudioText";
import { claimGrammarPlayback } from "@/features/grammar-audio/services/playbackCoordinator";

const note: GrammarNote = {
  id: "note",
  ownerId: "owner",
  version: 2,
  createdAt: "",
  updatedAt: "",
  source: {
    sentence: "She is not a teacher but a doctor.",
    learningNote: "not A but B",
    revision: 0,
  },
  metadata: { source: "ai", sourceRevision: 0, title: "대조", tags: [], grammarKey: null },
  analysis: createGrammarAnalysis(),
  examples: [
    {
      id: "example",
      sentence: "It is not red but blue.",
      translation: "빨강이 아니라 파랑",
      targetExplanation: "대조",
      reviewStatus: "reviewed",
    },
  ],
};

describe("saved grammar audio", () => {
  it("resolves only source or adopted saved examples", () => {
    expect(
      resolveGrammarAudioText(note, { noteId: "note", sentenceId: "source", noteVersion: 2 }),
    ).toBe(note.source.sentence);
    expect(
      resolveGrammarAudioText(note, { noteId: "note", sentenceId: "example", noteVersion: 2 }),
    ).toBe(note.examples[0].sentence);
  });

  it("rejects stale versions, missing notes, unreviewed and arbitrary sentences", () => {
    expect(() =>
      resolveGrammarAudioText(note, { noteId: "note", sentenceId: "source", noteVersion: 1 }),
    ).toThrow();
    expect(() =>
      resolveGrammarAudioText(null, { noteId: "note", sentenceId: "source", noteVersion: 2 }),
    ).toThrow();
    expect(() =>
      resolveGrammarAudioText(note, { noteId: "note", sentenceId: "client text", noteVersion: 2 }),
    ).toThrow();
    expect(() =>
      resolveGrammarAudioText(
        { ...note, examples: [{ ...note.examples[0], reviewStatus: "needs-review" }] },
        { noteId: "note", sentenceId: "example", noteVersion: 2 },
      ),
    ).toThrow();
  });

  it("stops the current player when another sentence claims playback", () => {
    const first = jest.fn(),
      second = jest.fn();
    const releaseFirst = claimGrammarPlayback(first);
    const releaseSecond = claimGrammarPlayback(second);

    expect(first).toHaveBeenCalledTimes(1);
    releaseFirst();
    const releaseThird = claimGrammarPlayback(jest.fn());

    expect(second).toHaveBeenCalledTimes(1);
    releaseSecond();
    releaseThird();
  });
});
