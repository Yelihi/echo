import { createStore } from "zustand/vanilla";
import { grammarExampleSchema } from "@/entities/grammar-note";
import type { ExampleState, GrammarExampleManagerProps } from "../models/interface";
export function createExampleStore(dependencies: GrammarExampleManagerProps) {
  let request = 0;
  return createStore<ExampleState>((set, get) => ({
    note: dependencies.note,
    candidates: [],
    selected: [],
    pending: null,
    error: "",
    dirty: false,
    cancel: () => {
      request++;
    },
    discard: () => {
      request++;
      set({ candidates: [], selected: [], pending: null, error: "", dirty: false });
    },
    change: (id, field, value) => {
      if (get().pending === "save") return;
      request++;
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
      const token = ++request;
      set({ pending: id ?? "all", error: "" });
      try {
        const result = await dependencies.generate({
          noteId: state.note.id,
          expectedVersion: state.note.version,
          count: id ? 1 : 3,
        });
        if (token !== request) return;
        if (!result.ok) {
          set({ pending: null, error: result.message });
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
        // 부분 재생성은 해당 후보만 교체하며 다른 수정본과 선택 상태를 유지한다.
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
        if (token === request)
          set({
            pending: null,
            error: "예문 생성에 실패했습니다. 기존 후보를 유지했으니 다시 생성해 주세요.",
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
        set({ error: "저장할 예문을 선택하고 문장·뜻·어법 설명을 모두 입력해 주세요." });
        return;
      }
      set({ pending: "save", error: "" });
      try {
        const result = await dependencies.save({
          noteId: state.note.id,
          expectedVersion: state.note.version,
          candidates,
        });
        if (!result.ok) {
          set({ pending: null, error: result.message });
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
          error: "예문을 저장하지 못했습니다. 선택과 수정 내용을 유지했습니다. 다시 저장해 주세요.",
        });
      }
    },
  }));
}
