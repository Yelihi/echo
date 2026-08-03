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
