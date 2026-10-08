import { createStore } from "zustand/vanilla";
import { grammarExampleSchema } from "@/entities/grammar-note";
import type { ExampleState, GrammarExampleManagerProps } from "../models/interface";
export function createExampleStore(dependencies: GrammarExampleManagerProps) {
  // 재생성 중 사용자가 후보를 수정할 수 있으므로, 수정 이전에 시작한 응답은 적용하지 않는다.
  let generation = 0;
  return createStore<ExampleState>((set, get) => ({
    note: dependencies.note,
    candidates: [],
    selected: [],
    pending: null,
    error: null,
    dirty: false,
    cancel: () => {
      generation++;
    },
    discard: () => {
      generation++;
      set({ candidates: [], selected: [], pending: null, error: null, dirty: false });
    },
    change: (id, field, value) => {
      if (get().pending === "save") return;
      generation++;
      set((state) => ({
        candidates: state.candidates.map((candidate) =>
          candidate.id === id
            ? { ...candidate, [field]: value, reviewStatus: "needs-review" }
            : candidate,
        ),
        selected: state.selected.filter((value) => value !== id),
        pending: null,
        dirty: true,
      }));
    },
    select: (id, selected) =>
      set((state) => ({
        selected: selected
          ? [...new Set([...state.selected, id])]
          : state.selected.filter((value) => value !== id),
        dirty: true,
      })),
    generate: async (id) => {
      const state = get();
      if (state.pending) return;
      if (id && !state.candidates.some((candidate) => candidate.id === id)) return;
      const currentGeneration = ++generation;
      set({ pending: id ?? "all", error: null });
      try {
        const result = await dependencies.generate({
          noteId: state.note.id,
          expectedVersion: state.note.version,
          count: id ? 1 : 3,
        });
        if (currentGeneration !== generation) return;
        if (!result.ok) {
          set({ pending: null, error: result.code });
          return;
        }
        const candidates = result.data.map((candidate) => grammarExampleSchema.parse(candidate));
        if (
          candidates.length !== (id ? 1 : 3) ||
          new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length
        )
          throw new Error("INVALID_CANDIDATES");
        if (
          id &&
          state.candidates.some(
            (candidate) => candidate.id !== id && candidate.id === candidates[0].id,
          )
        )
          throw new Error("DUPLICATE_CANDIDATE");
        set((current) => ({
          candidates: id
            ? current.candidates.map((candidate) =>
                candidate.id === id ? candidates[0] : candidate,
              )
            : candidates,
          selected: id ? current.selected.filter((value) => value !== id) : [],
          pending: null,
          dirty: true,
        }));
      } catch {
        if (currentGeneration === generation)
          set({
            pending: null,
            error: "GENERATION_FAILED",
          });
      }
    },
    save: async () => {
      const state = get();
      if (state.pending) return;
      const candidates = state.candidates.filter((candidate) =>
        state.selected.includes(candidate.id),
      );
      if (
        !candidates.length ||
        candidates.some((candidate) => !grammarExampleSchema.safeParse(candidate).success)
      ) {
        set({ error: "INVALID_SELECTION" });
        return;
      }
      set({ pending: "save", error: null });
      try {
        const result = await dependencies.save({
          noteId: state.note.id,
          expectedVersion: state.note.version,
          candidates,
        });
        if (!result.ok) {
          set({ pending: null, error: result.code });
          return;
        }
        set((current) => ({
          note: result.data,
          candidates: current.candidates.filter(
            (candidate) => !state.selected.includes(candidate.id),
          ),
          selected: [],
          pending: null,
          dirty: current.candidates.some((candidate) => !state.selected.includes(candidate.id)),
        }));
        dependencies.onUpdated(result.data);
      } catch {
        set({
          pending: null,
          error: "SAVE_FAILED",
        });
      }
    },
  }));
}
