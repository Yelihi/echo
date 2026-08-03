import { notFound } from "next/navigation";

import {
  getRoleplayEditorMockDraft,
  roleplayEditorEmptyDraft,
} from "@/views/role-play/config/editorMock";
import { RolePlayEditorClient } from "@/views/role-play/ui/RolePlayEditorClient";
import type { RolePlayEditorViewProps } from "@/views/role-play/models/editor";

export function RolePlayEditorView({ mode, materialId }: RolePlayEditorViewProps) {
  const initialDraft =
    mode === "create" ? roleplayEditorEmptyDraft : getRoleplayEditorMockDraft(materialId);

  if (!initialDraft) {
    notFound();
  }

  return <RolePlayEditorClient mode={mode} initialDraft={initialDraft} />;
}
