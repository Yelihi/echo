import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { MaterialId } from "@/entities/value-object";

// views
import type { RolePlayEditorViewProps } from "@/views/role-play/models/interface";
import { getRolePlayEditorDraft } from "@/views/role-play/services/server/getRolePlayEditorDraft";
import { RolePlayEditorClient } from "@/views/role-play/ui/editor/RolePlayEditorClient";

export async function RolePlayEditorView({ mode, materialId }: RolePlayEditorViewProps) {
  if (mode === "create") {
    return <RolePlayEditorClient mode="create" />;
  }

  if (!materialId || !isUuidString(materialId)) {
    notFound();
  }

  const initialDraft = await getRolePlayEditorDraft(materialId as MaterialId);

  if (!initialDraft) {
    notFound();
  }

  return <RolePlayEditorClient mode="edit" initialDraft={initialDraft} />;
}
