import { createStore } from "zustand/vanilla";
import { grammarNoteContentSchema, grammarSourceSchema } from "@/entities/grammar-note";
import type { EditorState, GrammarNoteEditorProps } from "../models/interface";

export function createEditorStore(
  dependencies: Omit<GrammarNoteEditorProps, "AnalysisEditor" | "onExit">,
) {
  const initial = dependencies.initialNote;
  let request = 0;
  let saveIdentity: { content: string; id: string } | null = null;
  return createStore<EditorState>((set, get) => ({
    source: initial?.source ?? { sentence: "", learningNote: "", revision: 0 },
    result: initial
      ? { status: "analyzed", data: { metadata: initial.metadata, analysis: initial.analysis } }
      : null,
    stage: initial ? "review" : "input",
    pending: null,
    error: "",
    fieldErrors: {},
    reviewed: false,
    dirty: false,
    changeSource: (field, value) => {
      if (get().pending === "save") return;
      request++;
      set((state) => ({
        source: { ...state.source, [field]: value, revision: state.source.revision + 1 },
        result: null,
        stage: "input",
        pending: null,
        reviewed: false,
        dirty: true,
        error: "",
        fieldErrors: {},
      }));
    },
    changeAnalysis: (analysis) =>
      set((state) =>
        state.result?.status === "analyzed"
          ? {
              result: { status: "analyzed", data: { ...state.result.data, analysis } },
              reviewed: false,
              dirty: true,
            }
          : {},
      ),
    markDirty: () => set({ dirty: true, reviewed: false }),
    setReviewed: (reviewed) => set({ reviewed }),
    back: () => {
      if (get().pending === "save") return;
      request++;
      set({ stage: "input", pending: null, error: "" });
    },
    cancel: () => {
      request++;
    },
    analyze: async () => {
      if (get().pending) return;
      const parsed = grammarSourceSchema.safeParse(get().source);
      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        set({
          fieldErrors: { sentence: errors.sentence?.[0], learningNote: errors.learningNote?.[0] },
        });
        return;
      }
      const token = ++request;
      set({ pending: "analysis", error: "", fieldErrors: {} });
      try {
        const result = await dependencies.analyze(parsed.data);
        if (token !== request) return;
        // 클라이언트 주입 경계에서도 다른 원문/리비전 결과를 적용하지 않는다.
        if (
          result.status === "needs-input" &&
          result.precheck.sourceRevision !== parsed.data.revision
        )
          throw new Error("STALE_PRECHECK");
        if (result.status === "analyzed") {
          const content = grammarNoteContentSchema.safeParse({
            source: parsed.data,
            ...result.data,
            examples: [],
          });
          if (!content.success) throw new Error("INVALID_ANALYSIS");
        }
        set({
          result,
          pending: null,
          stage: result.status === "analyzed" ? "review" : "input",
          reviewed: false,
          error: result.status === "error" ? result.message : "",
        });
      } catch {
        if (token === request)
          set({
            pending: null,
            error: "분석을 완료하지 못했습니다. 입력을 유지했으니 다시 시도해 주세요.",
          });
      }
    },
    save: async () => {
      const state = get();
      if (state.pending || !state.reviewed || state.result?.status !== "analyzed") return;
      const content = grammarNoteContentSchema.safeParse({
        source: state.source,
        ...state.result.data,
        analysis: { ...state.result.data.analysis, reviewStatus: "reviewed" },
        examples: initial?.examples ?? [],
      });
      if (!content.success) {
        set({ error: "분석과 입력을 다시 확인해 주세요." });
        return;
      }
      const signature = JSON.stringify(content.data);
      // 동일 저장의 네트워크 재시도에는 동일 UUID를 보내 서버 중복 생성을 막는다.
      if (saveIdentity?.content !== signature)
        saveIdentity = { content: signature, id: crypto.randomUUID() };
      set({ pending: "save", error: "" });
      try {
        const result = await dependencies.save({
          requestId: saveIdentity.id,
          content: content.data,
          ...(initial ? { existing: { id: initial.id, expectedVersion: initial.version } } : {}),
        });
        if (!result.ok) {
          set({ pending: null, error: result.message });
          return;
        }
        set({ pending: null, dirty: false });
        dependencies.onSaved(result.note);
      } catch {
        set({ pending: null, error: "저장하지 못했습니다. 입력을 유지했으니 다시 저장해 주세요." });
      }
    },
  }));
}
