// shared
import { createStore } from "@/shared/lib/store/create-store";

// views
import { MEMORIZATION_EDITOR_EMPTY_DRAFT } from "@/views/memorization/models/converter/convertMemorizationEditorDraft";
import type {
  MemorizationEditorDraft,
  MemorizationEditorStore,
} from "@/views/memorization/models/editor";

const withUnconfirmedParagraphs = (
  draft: MemorizationEditorDraft,
  changes: Partial<Pick<MemorizationEditorDraft, "rawText" | "paragraphs">>,
): MemorizationEditorDraft => ({
  ...draft,
  ...changes,
  ...(draft.confirmed ? { confirmed: false } : {}),
});

/**
 * `index` 문단을 바로 위(`index - 1`)로 흡수한다.
 * 아래 방향 합병이 아니다. 호출부는 항상 "위 문단과 합치기"다.
 */
const mergeParagraphIntoPreviousAt = (paragraphs: string[], index: number): string[] =>
  paragraphs.reduce<string[]>((next, paragraph, currentIndex) => {
    if (currentIndex === index - 1) {
      next.push(`${paragraph} ${paragraphs[index]}`.trim());
      return next;
    }

    if (currentIndex !== index) {
      next.push(paragraph);
    }

    return next;
  }, []);

export const useMemorizationEditorStore = createStore<MemorizationEditorStore>(
  "memorizationEditor",
  (set) => ({
    draft: MEMORIZATION_EDITOR_EMPTY_DRAFT,
    edited: false,
    hydrate: (draft) => set({ draft, edited: false }),
    setTitle: (title) => set((state) => ({ draft: { ...state.draft, title }, edited: true })),
    setTags: (tags) => set((state) => ({ draft: { ...state.draft, tags }, edited: true })),
    setRawText: (rawText) =>
      set((state) => ({
        draft: withUnconfirmedParagraphs(state.draft, { rawText }),
        edited: true,
      })),
    setParagraphs: (paragraphs) =>
      set((state) => ({
        draft: withUnconfirmedParagraphs(state.draft, { paragraphs }),
        edited: true,
      })),
    updateParagraph: (index, value) =>
      set((state) => ({
        draft: withUnconfirmedParagraphs(state.draft, {
          paragraphs: state.draft.paragraphs.map((paragraph, paragraphIndex) =>
            paragraphIndex === index ? value : paragraph,
          ),
        }),
        edited: true,
      })),
    mergeParagraphIntoPrevious: (index) =>
      set((state) => {
        if (index === 0) {
          return state;
        }

        return {
          draft: withUnconfirmedParagraphs(state.draft, {
            paragraphs: mergeParagraphIntoPreviousAt(state.draft.paragraphs, index),
          }),
          edited: true,
        };
      }),
    deleteParagraph: (index) =>
      set((state) => ({
        draft: withUnconfirmedParagraphs(state.draft, {
          paragraphs: state.draft.paragraphs.filter(
            (_, paragraphIndex) => paragraphIndex !== index,
          ),
        }),
        edited: true,
      })),
    confirmParagraphs: (paragraphs) =>
      set((state) => ({
        draft: { ...state.draft, paragraphs, confirmed: true },
        edited: true,
      })),
    markDirty: () => set({ edited: true }),
    reset: () => set({ draft: MEMORIZATION_EDITOR_EMPTY_DRAFT, edited: false }),
  }),
);
