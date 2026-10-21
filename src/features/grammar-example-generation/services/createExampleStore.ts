import { createStore } from "zustand/vanilla";
import { grammarExampleSchema } from "@/entities/grammar-note";
import { errorPopupManager } from "@/shared/lib/error-popup";
import type { ExampleState, GrammarExampleManagerProps } from "../models/interface";
import {
  exampleErrorMessage,
  isBlockedExampleError,
  type ExampleErrorCode,
} from "../models/errors";
import { saveExamplesCommandSchema } from "../models/schema";

function showExampleError(code: ExampleErrorCode) {
  errorPopupManager.open({
    title: "예문 작업을 완료하지 못했습니다",
    message: exampleErrorMessage(code),
    code,
  });
}

export function createExampleStore(dependencies: GrammarExampleManagerProps) {
  // 재생성 중 사용자가 후보를 수정할 수 있으므로, 수정 이전에 시작한 응답은 적용하지 않는다.
  let generation = 0;

  return createStore<ExampleState>((set, get) => ({
    note: dependencies.note,
    candidates: [],
    editing: {},
    selected: [],
    pending: null,
    error: null,
    dirty: false,

    cancel: () => {
      generation++;
    },

    discard: () => {
      generation++;
      set({ candidates: [], editing: {}, selected: [], pending: null, error: null, dirty: false });
    },

    startEdit: (id) =>
      set((state) => {
        const candidate = state.candidates.find((item) => item.id === id);
        if (!candidate || state.pending || state.editing[id]) return state;
        return {
          editing: { ...state.editing, [id]: candidate },
          selected: state.selected.filter((value) => value !== id),
        };
      }),

    cancelEdit: (id) => {
      generation++;
      set((state) => {
        const original = state.editing[id];
        if (!original || state.pending === "save") return state;
        const editing = { ...state.editing };
        delete editing[id];
        return {
          candidates: state.candidates.map((item) => (item.id === id ? original : item)),
          editing,
          pending: null,
          error: isBlockedExampleError(state.error) ? state.error : null,
        };
      });
    },

    finishEdit: (id) => {
      const state = get();
      const candidate = state.candidates.find((item) => item.id === id);
      if (!state.editing[id] || state.pending || !candidate?.directReading) return;
      if (
        !saveExamplesCommandSchema.safeParse({
          noteId: state.note.id,
          expectedVersion: state.note.version,
          candidates: [candidate],
        }).success
      ) {
        set({ error: "INVALID_SELECTION" });
        showExampleError("INVALID_SELECTION");
        return;
      }
      set((current) => {
        const editing = { ...current.editing };
        delete editing[id];
        return { editing, error: null };
      });
    },

    change: (id, field, value) => {
      if (get().pending === "save" || !get().editing[id]) return;

      generation++;
      set((state) => ({
        candidates: state.candidates.map((candidate) =>
          candidate.id === id
            ? {
                ...candidate,
                [field]: value,
                ...(field === "sentence" ? { directReading: undefined } : {}),
                reviewStatus: "needs-review",
              }
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
          ? state.pending ||
            state.editing[id] ||
            !state.candidates.find((candidate) => candidate.id === id)?.directReading
            ? state.selected
            : [...new Set([...state.selected, id])]
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
          showExampleError(result.code);

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
          editing: id
            ? Object.fromEntries(Object.entries(current.editing).filter(([key]) => key !== id))
            : {},
          pending: null,
          dirty: true,
        }));
      } catch {
        if (currentGeneration === generation) {
          set({
            pending: null,
            error: "GENERATION_FAILED",
          });
          showExampleError("GENERATION_FAILED");
        }
      }
    },

    regenerateDirectReading: async (id) => {
      const state = get();
      const candidate = state.candidates.find((item) => item.id === id);
      if (state.pending || !candidate) return;

      const currentGeneration = ++generation;
      set({ pending: `blocks:${id}`, error: null });
      try {
        const result = await dependencies.regenerateDirectReading({
          noteId: state.note.id,
          expectedVersion: state.note.version,
          sentence: candidate.sentence,
        });
        if (currentGeneration !== generation) return;
        if (!result.ok) {
          set({ pending: null, error: result.code });
          showExampleError(result.code);
          return;
        }
        const updated = grammarExampleSchema.parse({ ...candidate, directReading: result.data });
        set((current) => ({
          candidates: current.candidates.map((item) => (item.id === id ? updated : item)),
          editing: Object.fromEntries(
            Object.entries(current.editing).filter(([key]) => key !== id),
          ),
          pending: null,
        }));
      } catch {
        if (currentGeneration === generation) {
          set({ pending: null, error: "GENERATION_FAILED" });
          showExampleError("GENERATION_FAILED");
        }
      }
    },

    save: async () => {
      const state = get();

      if (state.pending) return;

      const candidates = state.candidates.filter((candidate) =>
        state.selected.includes(candidate.id),
      );

      if (
        !saveExamplesCommandSchema.safeParse({
          noteId: state.note.id,
          expectedVersion: state.note.version,
          candidates,
        }).success
      ) {
        set({ error: "INVALID_SELECTION" });
        showExampleError("INVALID_SELECTION");

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
          showExampleError(result.code);

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
        showExampleError("SAVE_FAILED");
      }
    },
  }));
}
