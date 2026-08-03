import { notFound } from "next/navigation";

import {
  getMemorizationEditorMockDraft,
  memorizationEditorEmptyDraft,
} from "@/views/memorization/config/editorMock";
import { MemorizationEditorClient } from "@/views/memorization/ui/MemorizationEditorClient";
import type { MemorizationEditorViewProps } from "@/views/memorization/models/editor";

export function MemorizationEditorView({ mode, materialId }: MemorizationEditorViewProps) {
  const initialDraft =
    mode === "create" ? memorizationEditorEmptyDraft : getMemorizationEditorMockDraft(materialId);

  if (!initialDraft) {
    notFound();
  }

  return <MemorizationEditorClient mode={mode} initialDraft={initialDraft} />;
}
