import { describe, expect, it } from "@jest/globals";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { getChunkReading } from "@/features/grammar-analysis-edit/models/chunkReading";

describe("reading existing analysis", () => {
  it("shows the specific role without the enclosing generic clause", () => {
    expect(getChunkReading(createGrammarAnalysis(), "c1")).toMatchObject({
      text: "She",
      meaning: "그녀는",
      roles: ["주어"],
      constructions: [],
    });
  });
  it("associates discontinuous constructions with their overlapping chunk", () => {
    const analysis = createGrammarAnalysis();
    expect(getChunkReading(analysis, "c3")?.constructions).toEqual(analysis.constructions);
    expect(getChunkReading(analysis, "c2")?.constructions).toEqual([]);
  });
  it("returns no reading for a deleted or non-chunk selection", () => {
    expect(getChunkReading(createGrammarAnalysis(), "missing")).toBeNull();
    expect(getChunkReading(createGrammarAnalysis(), "clause")).toBeNull();
  });
});
