import { describe, expect, it } from "@jest/globals";
import type { SentenceAnalysis } from "../entity";
import {
  grammarNoteContentSchema,
  grammarSourceSchema,
  precheckResultSchema,
  sentenceAnalysisSchema,
} from "../schema";
import { isValidTextRange } from "../validation";

function createAnalysis(): SentenceAnalysis {
  return {
    sourceText: "She is not a teacher but a doctor.",
    sourceRevision: 0,
    chunks: [
      { id: "chunk-1", range: { start: 0, end: 4 }, literalMeaning: "그녀는", explanation: "" },
      { id: "chunk-2", range: { start: 4, end: 7 }, literalMeaning: "이다", explanation: "" },
      {
        id: "chunk-3",
        range: { start: 7, end: 34 },
        literalMeaning: "교사가 아니라 의사",
        explanation: "",
      },
    ],
    syntax: [
      {
        id: "clause",
        ranges: [{ start: 0, end: 34 }],
        parentId: null,
        role: "other",
        label: "절",
        explanation: "",
      },
      {
        id: "subject",
        ranges: [{ start: 0, end: 3 }],
        parentId: "clause",
        role: "subject",
        label: "주어",
        explanation: "",
      },
    ],
    constructions: [
      {
        id: "contrast",
        name: "not A but B",
        ranges: [
          { start: 7, end: 10 },
          { start: 21, end: 24 },
        ],
        meaning: "A가 아니라 B",
        explanation: "",
      },
    ],
    naturalTranslation: "그녀는 교사가 아니라 의사입니다.",
    reviewStatus: "needs-review",
  };
}

describe("grammar source", () => {
  it.each(["", "  ", "\n"])("rejects blank required input %j", (empty) => {
    expect(
      grammarSourceSchema.safeParse({ sentence: empty, learningNote: "대조", revision: 0 }).success,
    ).toBe(false);
    expect(
      grammarSourceSchema.safeParse({
        sentence: "She is a doctor.",
        learningNote: empty,
        revision: 0,
      }).success,
    ).toBe(false);
  });
  it("preserves source whitespace and rejects user-supplied metadata", () => {
    const input = { sentence: " She is a doctor. ", learningNote: "보어", revision: 0 };
    expect(grammarSourceSchema.parse(input).sentence).toBe(input.sentence);
    expect(grammarSourceSchema.safeParse({ ...input, title: "내 제목", tags: [] }).success).toBe(
      false,
    );
  });
});

describe("sentence analysis invariants", () => {
  it("accepts nested syntax and a discontinuous construction over unchanged source", () => {
    const analysis = sentenceAnalysisSchema.parse(createAnalysis());
    expect(
      analysis.chunks
        .map(({ range }) => analysis.sourceText.slice(range.start, range.end))
        .join(""),
    ).toBe(analysis.sourceText);
  });
  it.each([
    { start: -1, end: 3 },
    { start: 0, end: 35 },
    { start: 2, end: 2 },
    { start: 3, end: 2 },
    { start: 0.5, end: 3 },
  ])("rejects invalid range %j", (range) => {
    const analysis = createAnalysis();
    expect(
      sentenceAnalysisSchema.safeParse({ ...analysis, chunks: [{ ...analysis.chunks[0], range }] })
        .success,
    ).toBe(false);
  });
  it("rejects a surrogate split but allows a whole Unicode character", () => {
    expect(isValidTextRange("A😀B", { start: 1, end: 2 })).toBe(false);
    expect(isValidTextRange("A😀B", { start: 1, end: 3 })).toBe(true);
  });
  it.each([3, 5])("rejects chunk gaps or overlap at %s", (start) => {
    const a = createAnalysis();
    expect(
      sentenceAnalysisSchema.safeParse({
        ...a,
        chunks: [a.chunks[0], { ...a.chunks[1], range: { start, end: 7 } }, a.chunks[2]],
      }).success,
    ).toBe(false);
  });
  it("rejects duplicate IDs across annotation kinds", () => {
    const a = createAnalysis();
    expect(
      sentenceAnalysisSchema.safeParse({
        ...a,
        constructions: [{ ...a.constructions[0], id: "subject" }],
      }).success,
    ).toBe(false);
  });
  it.each(["missing", "subject"])("rejects missing or self parent %s", (parentId) => {
    const a = createAnalysis();
    expect(
      sentenceAnalysisSchema.safeParse({
        ...a,
        syntax: [a.syntax[0], { ...a.syntax[1], parentId }],
      }).success,
    ).toBe(false);
  });
  it("rejects multi-node cycles even with equal contained ranges", () => {
    const a = createAnalysis();
    expect(
      sentenceAnalysisSchema.safeParse({
        ...a,
        syntax: [
          { ...a.syntax[0], parentId: "subject" },
          { ...a.syntax[1], ranges: a.syntax[0].ranges },
        ],
      }).success,
    ).toBe(false);
  });
  it("rejects a child outside its parent", () => {
    const a = createAnalysis();
    expect(
      sentenceAnalysisSchema.safeParse({
        ...a,
        syntax: [{ ...a.syntax[0], ranges: [{ start: 4, end: 34 }] }, a.syntax[1]],
      }).success,
    ).toBe(false);
  });
  it("rejects overlapping ranges within one annotation", () => {
    const a = createAnalysis();
    expect(
      sentenceAnalysisSchema.safeParse({
        ...a,
        constructions: [
          {
            ...a.constructions[0],
            ranges: [
              { start: 7, end: 24 },
              { start: 21, end: 24 },
            ],
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("note and precheck contracts", () => {
  function content() {
    const analysis = createAnalysis();
    return {
      source: { sentence: analysis.sourceText, learningNote: "not A but B", revision: 0 },
      metadata: {
        source: "ai",
        title: "not A but B",
        tags: ["대조"],
        grammarKey: null,
        sourceRevision: 0,
      },
      analysis,
      examples: [],
    };
  }
  it("accepts a note before examples exist", () => {
    expect(grammarNoteContentSchema.safeParse(content()).success).toBe(true);
  });
  it("rejects silent source correction", () => {
    const note = content();
    expect(
      grammarNoteContentSchema.safeParse({
        ...note,
        source: { ...note.source, sentence: "He is a doctor." },
      }).success,
    ).toBe(false);
  });
  it.each(["analysis", "metadata"] as const)("rejects stale %s", (key) => {
    const note = content();
    expect(
      grammarNoteContentSchema.safeParse({ ...note, [key]: { ...note[key], sourceRevision: 1 } })
        .success,
    ).toBe(false);
  });
  it("requires explanations for a precheck that cannot pass", () => {
    expect(
      precheckResultSchema.safeParse({ status: "uncertain", sourceRevision: 0, issues: [] })
        .success,
    ).toBe(false);
    expect(precheckResultSchema.safeParse({ status: "passed", sourceRevision: 0 }).success).toBe(
      true,
    );
  });
});
