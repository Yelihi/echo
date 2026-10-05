import { describe, expect, it, jest } from "@jest/globals";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { editAnalysis } from "@/features/grammar-analysis-edit/services/editAnalysis";
import { createAnalysisEditorStore } from "@/features/grammar-analysis-edit/models/store";

describe("analysis edits", () => {
  it("moves adjacent boundaries together without changing source and requires review", () => {
    const source = createGrammarAnalysis();
    const result = editAnalysis(source, { type: "move-boundary", chunkId: "c1", end: 3 });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.analysis.chunks[0].range.end).toBe(3);
    expect(result.analysis.chunks[1].range.start).toBe(3);
    expect(result.analysis.sourceText).toBe(source.sourceText);
    expect(result.analysis.reviewStatus).toBe("needs-review");
    expect(source.chunks[0].range.end).toBe(4);
  });
  it.each([-1, 0, 7, 100, NaN])("rejects an invalid boundary %s atomically", (end) => {
    const source = createGrammarAnalysis();
    const before = JSON.stringify(source);
    expect(editAnalysis(source, { type: "move-boundary", chunkId: "c1", end }).ok).toBe(false);
    expect(JSON.stringify(source)).toBe(before);
  });
  it("splits and merges meaning chunks while preserving exact text coverage", () => {
    const source = createGrammarAnalysis();
    const split = editAnalysis(source, {
      type: "split-chunk",
      chunkId: "c3",
      offset: 21,
      newId: "c4",
    });
    if (!split.ok) throw new Error(split.message);
    expect(split.analysis.chunks).toHaveLength(4);
    const merged = editAnalysis(split.analysis, { type: "merge-next", chunkId: "c3" });
    if (!merged.ok) throw new Error(merged.message);
    expect(merged.analysis.chunks.map((c) => c.range)).toEqual(source.chunks.map((c) => c.range));
  });
  it("rejects unknown targets and duplicate IDs", () => {
    const a = createGrammarAnalysis();
    expect(editAnalysis(a, { type: "merge-next", chunkId: "missing" }).ok).toBe(false);
    expect(editAnalysis(a, { type: "split-chunk", chunkId: "c3", offset: 21, newId: "s" }).ok).toBe(
      false,
    );
  });
  it("allows reparenting a child to root and rejects deleting its parent while attached", () => {
    const a = createGrammarAnalysis();
    expect(editAnalysis(a, { type: "delete-syntax", id: "clause" }).ok).toBe(false);
    const result = editAnalysis(a, {
      type: "save-syntax",
      annotation: { ...a.syntax[1], parentId: null },
    });
    expect(result.ok).toBe(true);
  });
  it("rejects reparenting into a descendant", () => {
    const a = createGrammarAnalysis();
    expect(
      editAnalysis(a, { type: "save-syntax", annotation: { ...a.syntax[0], parentId: "s" } }).ok,
    ).toBe(false);
  });
  it("supports discontinuous construction boundary edits", () => {
    const a = createGrammarAnalysis();
    const result = editAnalysis(a, {
      type: "save-construction",
      annotation: {
        ...a.constructions[0],
        ranges: [
          { start: 7, end: 20 },
          { start: 21, end: 33 },
        ],
      },
    });
    expect(result.ok).toBe(true);
  });
  it("does not notify document consumers when only selection changes or an edit fails", () => {
    const onChange = jest.fn();
    const store = createAnalysisEditorStore({ initialAnalysis: createGrammarAnalysis(), onChange });
    const original = store.getState().analysis;
    store.getState().select("c1");
    store.getState().edit({ type: "move-boundary", chunkId: "c1", end: -1 });
    expect(store.getState().analysis).toBe(original);
    expect(onChange).not.toHaveBeenCalled();
  });
});

it("applies text and structural edits together or preserves both on failure", () => {
  const onChange = jest.fn();
  const store = createAnalysisEditorStore({ initialAnalysis: createGrammarAnalysis(), onChange });
  const before = store.getState().analysis;
  const result = store.getState().edit([
    { type: "edit-chunk", chunkId: "c1", literalMeaning: "수정한 뜻", explanation: "" },
    { type: "move-boundary", chunkId: "c1", end: -1 },
  ]);
  expect(result.ok).toBe(false);
  expect(store.getState().analysis).toBe(before);
  expect(onChange).not.toHaveBeenCalled();
});
