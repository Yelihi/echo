import type { ReactNode } from "react";
import type { MemorizationParagraphSuggestionProps } from "@/features/memorization-paragraph-suggestion/models/interface";
export type MemorizationEditorMode = "create" | "edit";

export interface MemorizationEditorDraft {
  title: string;
  tags: string[];
  rawText: string;
  paragraphs: string[];
  confirmed: boolean;
}

export interface MemorizationEditorViewProps {
  mode: MemorizationEditorMode;
  materialId?: string;
}

export interface MemorizationEditorStore {
  draft: MemorizationEditorDraft;
  edited: boolean;
  hydrate: (draft: MemorizationEditorDraft) => void;
  setTitle: (title: string) => void;
  setTags: (tags: string[]) => void;
  setRawText: (rawText: string) => void;
  setParagraphs: (paragraphs: string[]) => void;
  updateParagraph: (index: number, value: string) => void;
  mergeParagraphIntoPrevious: (index: number) => void;
  deleteParagraph: (index: number) => void;
  confirmParagraphs: (paragraphs: string[]) => void;
  markDirty: () => void;
  reset: () => void;
}

export type CreateMemorizationMaterialResult =
  | { code: "SUCCESS"; materialId: string }
  | { code: "MEM-001" }
  | { code: "MEM-002" }
  | { code: "MEM-003" };

export interface MemorizationEditorClientProps {
  mode: MemorizationEditorMode;
  materialId?: string;
  initialDraft?: MemorizationEditorDraft;
}
export interface MemorizationEditorHeaderProps {
  mode: MemorizationEditorMode;
  isSaving: boolean;
  isBusy: boolean;
  onSave: () => void;
}
export interface MemorizationEditorSourcePanelProps {
  paragraphSuggestion: MemorizationParagraphSuggestionProps;
}
export interface ParagraphActionButtonProps {
  label: string;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}
export interface MemorizationParagraphItemProps {
  index: number;
}
