import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { MaterialId } from "@/entities/value-object";

// views
import type { MemorizationEditorViewProps } from "@/views/memorization/models/editor";
import { getMemorizationEditorDraft } from "@/views/memorization/services/server/getMemorizationEditorDraft";
import { MemorizationEditorClient } from "@/views/memorization/ui/editor/MemorizationEditorClient";

export async function MemorizationEditorView({ mode, materialId }: MemorizationEditorViewProps) {
  if (mode === "create") {
    return <MemorizationEditorClient mode="create" />;
  }

  if (!materialId || !isUuidString(materialId)) {
    notFound();
  }

  const initialDraft = await getMemorizationEditorDraft(materialId as MaterialId);

  if (!initialDraft) {
    notFound();
  }

  return <MemorizationEditorClient mode="edit" initialDraft={initialDraft} />;
}
