export type RoleplayEditorMode = "create" | "edit";

export type RoleplayEditorSpeaker = "partner" | "me";

export interface RoleplayEditorLineDraft {
  id: string;
  speaker: RoleplayEditorSpeaker;
  text: string;
}

export interface RoleplayEditorDraft {
  title: string;
  situation: string;
  tags: string[];
  lines: RoleplayEditorLineDraft[];
}

export interface RolePlayEditorViewProps {
  mode: RoleplayEditorMode;
  materialId?: string;
}
