import { createStore } from "zustand/vanilla";
import { sentenceAnalysisSchema } from "@/entities/grammar-note";
import type { AnalysisEditorProps, AnalysisEditorState } from "./interface";
import { editAnalysis } from "../services/editAnalysis";

export function createAnalysisEditorStore({ initialAnalysis, onChange }: AnalysisEditorProps) {
  return createStore<AnalysisEditorState>((set, get) => ({
    analysis: sentenceAnalysisSchema.parse(initialAnalysis),
    selectedId: null,
    readingId: null,
    editing: false,
    dirty: false,
    pendingSelection: null,
    startEditing: () =>
      set({ editing: true, selectedId: get().selectedId ?? get().analysis.chunks[0].id }),
    finishEditing: () => {
      const state = get();
      const id = state.analysis.chunks.some((chunk) => chunk.id === state.readingId)
        ? state.readingId
        : null;
      if (state.dirty) set({ pendingSelection: { id, editing: false } });
      else set({ selectedId: id, editing: false });
    },
    addSyntax: () => {
      if (get().dirty) return { ok: false, message: "현재 수정을 먼저 적용해 주세요." };
      const id = crypto.randomUUID();
      const result = get().edit({
        type: "save-syntax",
        annotation: {
          id,
          ranges: [{ start: 0, end: get().analysis.sourceText.length }],
          parentId: null,
          role: "other",
          label: "새 문법 항목",
          explanation: "",
        },
      });
      if (result.ok) set({ selectedId: id, editing: true });
      return result;
    },
    markDirty: () => {
      if (get().editing) set({ dirty: true });
    },
    resolveSelection: (discard) => {
      const pending = get().pendingSelection;
      if (discard && pending)
        set({
          selectedId: pending.id,
          editing: pending.editing,
          dirty: false,
          readingId: get().analysis.chunks.some((chunk) => chunk.id === pending.id)
            ? pending.id
            : get().readingId,
        });
      set({ pendingSelection: null });
    },
    select: (selectedId) => {
      if (get().dirty) set({ pendingSelection: { id: selectedId, editing: get().editing } });
      else
        set({
          selectedId,
          readingId: get().analysis.chunks.some((chunk) => chunk.id === selectedId)
            ? selectedId
            : get().readingId,
        });
    },
    edit: (command) => {
      const commands = "type" in command ? [command] : command;
      let analysis = get().analysis;
      for (const item of commands) {
        const result = editAnalysis(analysis, item);
        if (!result.ok) return result;
        analysis = result.analysis;
      }
      const result = { ok: true as const, analysis };
      if (result.ok) {
        const ids = [
          ...result.analysis.chunks,
          ...result.analysis.syntax,
          ...result.analysis.constructions,
        ].map((item) => item.id);
        const selectedId = get().selectedId;
        set({
          dirty: false,
          analysis: result.analysis,
          selectedId: selectedId && ids.includes(selectedId) ? selectedId : null,
        });
        onChange(result.analysis);
      }
      return result;
    },
  }));
}
