import { describe, expect, it, jest } from "@jest/globals";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { EditAnalysisService } from "@/features/grammar-analysis-edit/services/EditAnalysisService";
import type { AnalysisEdit } from "@/features/grammar-analysis-edit/models/editAnalysis";
import { createAnalysisEditorStore } from "@/features/grammar-analysis-edit/models/store";

describe("analysis edits", () => {
  it("moves adjacent boundaries together without changing source and requires review", () => {
    const source = createGrammarAnalysis();
    const result = new EditAnalysisService(source).moveBoundary("c1", 3);
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
    expect(new EditAnalysisService(source).moveBoundary("c1", end).ok).toBe(false);
    expect(JSON.stringify(source)).toBe(before);
  });
  it("splits and merges meaning chunks while preserving exact text coverage", () => {
    const source = createGrammarAnalysis();
    const split = new EditAnalysisService(source).splitChunk("c3", 21, "c4");
    if (!split.ok) throw new Error(split.message);
    expect(split.analysis.chunks).toHaveLength(4);
    const merged = new EditAnalysisService(split.analysis).mergeNext("c3");
    if (!merged.ok) throw new Error(merged.message);
    expect(merged.analysis.chunks.map((c) => c.range)).toEqual(source.chunks.map((c) => c.range));
  });
  it("rejects unknown targets and duplicate IDs", () => {
    const a = createGrammarAnalysis();
    expect(new EditAnalysisService(a).mergeNext("missing").ok).toBe(false);
    expect(new EditAnalysisService(a).splitChunk("c3", 21, "s").ok).toBe(false);
  });
  it("allows reparenting a child to root and rejects deleting its parent while attached", () => {
    const a = createGrammarAnalysis();
    expect(new EditAnalysisService(a).deleteSyntax("clause").ok).toBe(false);
    const result = new EditAnalysisService(a).saveSyntax({ ...a.syntax[1], parentId: null });
    expect(result.ok).toBe(true);
  });
  it("rejects reparenting into a descendant", () => {
    const a = createGrammarAnalysis();
    expect(new EditAnalysisService(a).saveSyntax({ ...a.syntax[0], parentId: "s" }).ok).toBe(false);
  });
  it("supports discontinuous construction boundary edits", () => {
    const a = createGrammarAnalysis();
    const result = new EditAnalysisService(a).saveConstruction({
      ...a.constructions[0],
      ranges: [
        { start: 7, end: 20 },
        { start: 21, end: 33 },
      ],
    });
    expect(result.ok).toBe(true);
  });
  it("does not notify document consumers when only selection changes or an edit fails", () => {
    const onChange = jest.fn();
    const store = createAnalysisEditorStore({ initialAnalysis: createGrammarAnalysis(), onChange });
    const original = store.getState().analysis;
    store.getState().select("c1");
    store.getState().edit((service) => service.moveBoundary("c1", -1));
    expect(store.getState().analysis).toBe(original);
    expect(onChange).not.toHaveBeenCalled();
  });
});

it("applies text and structural edits together or preserves both on failure", () => {
  const onChange = jest.fn();
  const store = createAnalysisEditorStore({ initialAnalysis: createGrammarAnalysis(), onChange });
  const before = store.getState().analysis;
  const result = store
    .getState()
    .edit([
      (service) => service.editChunk("c1", { literalMeaning: "수정한 뜻", explanation: "" }),
      (service) => service.moveBoundary("c1", -1),
    ]);
  expect(result.ok).toBe(false);
  expect(store.getState().analysis).toBe(before);
  expect(onChange).not.toHaveBeenCalled();
});

it("commits a successful batch once, preserving the first edit in the next candidate", () => {
  const onChange = jest.fn();
  const store = createAnalysisEditorStore({ initialAnalysis: createGrammarAnalysis(), onChange });
  store.getState().select("c1");
  store.getState().startEditing();
  store.getState().markDirty();
  const result = store
    .getState()
    .edit([
      (service) => service.editChunk("c1", { literalMeaning: "수정한 뜻", explanation: "설명" }),
      (service) => service.moveBoundary("c1", 3),
    ]);
  expect(result.ok).toBe(true);
  expect(store.getState().analysis.chunks[0]).toMatchObject({
    literalMeaning: "수정한 뜻",
    explanation: "설명",
    range: { start: 0, end: 3 },
  });
  expect(store.getState().dirty).toBe(false);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(store.getState().analysis);
});

it("keeps dirty input and selection and skips later operations when a batch fails", () => {
  const onChange = jest.fn();
  const store = createAnalysisEditorStore({ initialAnalysis: createGrammarAnalysis(), onChange });
  store.getState().select("c1");
  store.getState().startEditing();
  store.getState().markDirty();
  const before = store.getState().analysis;
  const later = jest.fn<AnalysisEdit>();
  const result = store
    .getState()
    .edit([
      (service) => service.editChunk("c1", { literalMeaning: "수정", explanation: "" }),
      (service) => service.moveBoundary("c1", -1),
      later,
    ]);
  expect(result.ok).toBe(false);
  expect(store.getState()).toMatchObject({ selectedId: "c1", dirty: true, editing: true });
  expect(store.getState().analysis).toBe(before);
  expect(later).not.toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
});

it("adds, updates and deletes annotations without changing the input snapshot", () => {
  const source = createGrammarAnalysis();
  const before = JSON.stringify(source);
  const service = new EditAnalysisService(source);
  const added = service.saveSyntax({ ...source.syntax[1], id: "new-subject" });
  if (!added.ok) throw new Error(added.message);
  expect(added.analysis.syntax).toHaveLength(source.syntax.length + 1);
  const deleted = new EditAnalysisService(added.analysis).deleteSyntax("new-subject");
  if (!deleted.ok) throw new Error(deleted.message);
  expect(deleted.analysis.syntax).toEqual(source.syntax);
  const construction = service.saveConstruction({ ...source.constructions[0], id: "new-contrast" });
  if (!construction.ok) throw new Error(construction.message);
  const updated = new EditAnalysisService(construction.analysis).saveConstruction({
    ...source.constructions[0],
    id: "new-contrast",
    meaning: "수정된 뜻",
  });
  if (!updated.ok) throw new Error(updated.message);
  expect(updated.analysis.constructions).toHaveLength(source.constructions.length + 1);
  expect(updated.analysis.constructions.find((item) => item.id === "new-contrast")?.meaning).toBe(
    "수정된 뜻",
  );
  const removed = new EditAnalysisService(updated.analysis).deleteConstruction("new-contrast");
  if (!removed.ok) throw new Error(removed.message);
  expect(removed.analysis.constructions).toEqual(source.constructions);
  expect(JSON.stringify(source)).toBe(before);
});

it("validates every edit method and rejects unknown targets without changing the source", () => {
  const source = createGrammarAnalysis();
  const service = new EditAnalysisService(source);
  const before = JSON.stringify(source);
  const invalid: AnalysisEdit[] = [
    (s) => s.editChunk("missing", { literalMeaning: "뜻", explanation: "" }),
    (s) => s.editChunk("c1", { literalMeaning: "x".repeat(4001), explanation: "" }),
    (s) => s.moveBoundary("missing", 3),
    (s) => s.moveBoundary("c3", 20),
    (s) => s.splitChunk("missing", 3, "new"),
    (s) => s.splitChunk("c1", 0, "new"),
    (s) => s.mergeNext("c3"),
    (s) => s.deleteSyntax("missing"),
    (s) => s.deleteConstruction("missing"),
    (s) => s.saveConstruction({ ...source.constructions[0], id: source.chunks[0].id }),
  ];
  for (const operation of invalid) expect(operation(service).ok).toBe(false);
  expect(JSON.stringify(source)).toBe(before);
});

it("updates only explanation fields even when the supplied object contains chunk identity", () => {
  const source = createGrammarAnalysis();
  const result = new EditAnalysisService(source).editChunk("c1", {
    ...source.chunks[1],
    literalMeaning: "수정한 뜻",
  });
  if (!result.ok) throw new Error(result.message);
  expect(result.analysis.chunks[0]).toMatchObject({
    id: "c1",
    range: source.chunks[0].range,
    literalMeaning: "수정한 뜻",
  });
  expect(result.analysis.sourceText).toBe(source.sourceText);
});

it("notifies dirty changes within editing events and keeps failed/discard-cancelled drafts dirty", () => {
  const onDirtyChange = jest.fn();
  const store = createAnalysisEditorStore({
    initialAnalysis: createGrammarAnalysis(),
    onChange: jest.fn(),
    onDirtyChange,
  });
  store.getState().markDirty();
  expect(onDirtyChange).not.toHaveBeenCalled();
  store.getState().startEditing();
  store.getState().markDirty();
  store.getState().markDirty();
  expect(onDirtyChange.mock.calls).toEqual([[true]]);
  const failed = store.getState().edit((service) =>
    service.saveSyntax({
      id: "s",
      ranges: [{ start: 0, end: 1 }],
      parentId: "s",
      role: "other",
      label: "invalid",
      explanation: "",
    }),
  );
  expect(failed.ok).toBe(false);
  expect(store.getState().dirty).toBe(true);
  store.getState().finishEditing();
  store.getState().resolveSelection(false);
  expect(store.getState().dirty).toBe(true);
  expect(onDirtyChange.mock.calls).toEqual([[true]]);
  store.getState().finishEditing();
  store.getState().resolveSelection(true);
  expect(store.getState().dirty).toBe(false);
  expect(onDirtyChange.mock.calls).toEqual([[true], [false]]);
});
