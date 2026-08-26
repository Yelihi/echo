// shared
import { createStore } from "@/shared/lib/store/create-store";

// views
import type {
  RoleplayEditorDraft,
  RoleplayEditorSpeaker,
  RolePlayEditorStore,
} from "@/views/role-play/models/interface";

const rolePlayEditorEmptyDraft: RoleplayEditorDraft = {
  title: "",
  situation: "",
  tags: [],
  lines: [],
};

const createLine = (speaker: RoleplayEditorSpeaker) => ({
  id: `line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  speaker,
  text: "",
});

export const useRolePlayEditorStore = createStore<RolePlayEditorStore>("rolePlayEditor", (set) => ({
  draft: rolePlayEditorEmptyDraft,
  edited: false,
  hydrate: (draft) => set({ draft, edited: false }),
  setTitle: (title) => set((state) => ({ draft: { ...state.draft, title }, edited: true })),
  setSituation: (situation) =>
    set((state) => ({ draft: { ...state.draft, situation }, edited: true })),
  setTags: (tags) => set((state) => ({ draft: { ...state.draft, tags }, edited: true })),
  updateLineText: (lineId, text) =>
    set((state) => ({
      draft: {
        ...state.draft,
        lines: state.draft.lines.map((line) => (line.id === lineId ? { ...line, text } : line)),
      },
      edited: true,
    })),
  flipLineSpeaker: (lineId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        lines: state.draft.lines.map((line) =>
          line.id === lineId
            ? { ...line, speaker: line.speaker === "me" ? "partner" : "me" }
            : line,
        ),
      },
      edited: true,
    })),
  deleteLine: (lineId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        lines: state.draft.lines.filter((line) => line.id !== lineId),
      },
      edited: true,
    })),
  addLine: (speaker) =>
    set((state) => ({
      draft: { ...state.draft, lines: [...state.draft.lines, createLine(speaker)] },
      edited: true,
    })),
  applyImportedScript: (lines) =>
    set((state) => ({
      draft: { ...state.draft, lines },
      edited: true,
    })),
  markDirty: () => set({ edited: true }),
  reset: () => set({ draft: rolePlayEditorEmptyDraft, edited: false }),
}));
