import { describe, expect, it } from "@jest/globals";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { convertAnalysisToChunkReading } from "@/features/grammar-analysis-edit/models/converters/convertAnalysisToChunkReading";

describe("reading existing analysis", () => {
  it("shows the specific role without the enclosing generic clause", () => {
    expect(convertAnalysisToChunkReading(createGrammarAnalysis(), "c1")).toMatchObject({
      text: "She",
      meaning: "그녀는",
      roles: ["주어"],
      constructions: [],
    });
  });
  it("associates discontinuous constructions with their overlapping chunk", () => {
    const analysis = createGrammarAnalysis();
    expect(convertAnalysisToChunkReading(analysis, "c3")?.constructions).toEqual(
      analysis.constructions,
    );
    expect(convertAnalysisToChunkReading(analysis, "c2")?.constructions).toEqual([]);
  });
  it("returns no reading for a deleted or non-chunk selection", () => {
    expect(convertAnalysisToChunkReading(createGrammarAnalysis(), "missing")).toBeNull();
    expect(convertAnalysisToChunkReading(createGrammarAnalysis(), "clause")).toBeNull();
  });
});
