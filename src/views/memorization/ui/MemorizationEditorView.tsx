import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { MaterialId } from "@/entities/value-object";

// views
import { MEMORIZATION_EDITOR_EMPTY_DRAFT } from "@/views/memorization/models/converter/convertMemorizationEditorDraft";
import type { MemorizationEditorViewProps } from "@/views/memorization/models/editor";
import { getMemorizationEditorDraft } from "@/views/memorization/services/server/getMemorizationEditorDraft";
import { MemorizationEditorClient } from "@/views/memorization/ui/MemorizationEditorClient";

export async function MemorizationEditorView({ mode, materialId }: MemorizationEditorViewProps) {
  if (mode === "create") {
    return (
      <MemorizationEditorClient mode="create" initialDraft={MEMORIZATION_EDITOR_EMPTY_DRAFT} />
    );
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
