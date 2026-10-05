import { createStore } from "zustand/vanilla";
import { sentenceAnalysisSchema } from "@/entities/grammar-note";
import type { AnalysisEditorProps, AnalysisEditorState } from "./interface";
import { editAnalysis } from "../services/editAnalysis";

export function createAnalysisEditorStore({ initialAnalysis, onChange }: AnalysisEditorProps) {
  return createStore<AnalysisEditorState>((set, get) => ({
    analysis: sentenceAnalysisSchema.parse(initialAnalysis),
    selectedId: null,
    editing: false,
    dirty: false,
    pendingSelection: null,
    startEditing: () => set({ editing: true }),
    markDirty: () => {
      if (get().editing) set({ dirty: true });
    },
    resolveSelection: (discard) => {
      const pending = get().pendingSelection;
      if (discard && pending) set({ selectedId: pending.id, editing: false, dirty: false });
      set({ pendingSelection: null });
    },
    select: (selectedId) => {
      if (get().dirty) set({ pendingSelection: { id: selectedId } });
      else set({ selectedId, editing: false });
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
