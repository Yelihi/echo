import { createStore } from "zustand/vanilla";
import { grammarNoteContentSchema, grammarSourceSchema } from "@/entities/grammar-note";
import type { EditorState, GrammarNoteEditorProps } from "../models/interface";

export function createEditorStore(
  dependencies: Omit<GrammarNoteEditorProps, "AnalysisEditor" | "onExit">,
) {
  const initialNote = dependencies.initialNote;
  // 입력 변경·화면 이탈 후에도 서버 분석은 끝날 수 있어, 현재 세대의 응답만 적용한다.
  let generation = 0;
  let saveIdentity: { content: string; id: string } | null = null;
  return createStore<EditorState>((set, get) => ({
    source: initialNote?.source ?? { sentence: "", learningNote: "", revision: 0 },
    result: initialNote
      ? {
          status: "analyzed",
          data: { metadata: initialNote.metadata, analysis: initialNote.analysis },
        }
      : null,
    stage: initialNote ? "review" : "input",
    pending: null,
    error: null,
    fieldErrors: {},
    reviewed: false,
    analysisDirty: false,
    setAnalysisDirty: (analysisDirty) => {
      if (get().analysisDirty === analysisDirty) return;
      set({ analysisDirty, ...(analysisDirty ? { dirty: true, reviewed: false } : {}) });
    },
    dirty: false,
    changeSource: (field, value) => {
      if (get().pending === "save") return;
      generation++;
      set((state) => ({
        source: { ...state.source, [field]: value, revision: state.source.revision + 1 },
        result: null,
        stage: "input",
        pending: null,
        reviewed: false,
        dirty: true,
        error: null,
        fieldErrors: {},
      }));
    },
    changeAnalysis: (analysis) =>
      set((state) =>
        state.result?.status === "analyzed"
          ? {
              result: { status: "analyzed", data: { ...state.result.data, analysis } },
              reviewed: false,
              analysisDirty: false,
              dirty: true,
            }
          : {},
      ),
    setReviewed: (reviewed) => set({ reviewed }),
    back: () => {
      if (get().pending === "save") return;
      generation++;
      set({ stage: "input", pending: null, error: null, analysisDirty: false });
    },
    cancel: () => {
      generation++;
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
      const currentGeneration = ++generation;
      set({ pending: "analysis", error: null, fieldErrors: {} });
      try {
        const result = await dependencies.analyze(parsed.data);
        if (currentGeneration !== generation) return;
        // 분석 함수는 주입받으므로 서버 구현의 검증을 가정하지 않고 원문·리비전 일치를 다시 확인한다.
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
          error: result.status === "error" ? { message: result.message } : null,
        });
      } catch {
        if (currentGeneration === generation)
          set({
            pending: null,
            error: { code: "ANALYSIS_FAILED" },
          });
      }
    },
    save: async () => {
      const state = get();
      if (
        state.pending ||
        state.analysisDirty ||
        !state.reviewed ||
        state.result?.status !== "analyzed"
      )
        return;
      const content = grammarNoteContentSchema.safeParse({
        source: state.source,
        ...state.result.data,
        analysis: { ...state.result.data.analysis, reviewStatus: "reviewed" },
        examples: initialNote?.examples ?? [],
      });
      if (!content.success) {
        set({ error: { code: "INVALID_ANALYSIS" } });
        return;
      }
      const signature = JSON.stringify(content.data);
      // 동일 저장의 네트워크 재시도에는 동일 UUID를 보내 서버 중복 생성을 막는다.
      if (saveIdentity?.content !== signature)
        saveIdentity = { content: signature, id: crypto.randomUUID() };
      set({ pending: "save", error: null });
      try {
        const result = await dependencies.save({
          requestId: saveIdentity.id,
          content: content.data,
          ...(initialNote
            ? { existing: { id: initialNote.id, expectedVersion: initialNote.version } }
            : {}),
        });
        if (!result.ok) {
          set({ pending: null, error: { code: result.code } });
          return;
        }
        set({ pending: null, dirty: false });
        dependencies.onSaved(result.note);
      } catch {
        set({ pending: null, error: { code: "PERSISTENCE_FAILED" } });
      }
    },
  }));
}
