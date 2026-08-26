// features
import type { RoleplayTxtImportDraft } from "@/features/roleplay-txt-import/models/schema";

// views
import type { RoleplayEditorLineDraft } from "@/views/role-play/models/interface";

export function convertRoleplayTxtImportToEditorLines(
  imported: RoleplayTxtImportDraft,
): RoleplayEditorLineDraft[] {
  return imported.lines.map((line, index) => ({
    id: `line-${line.speakerId}-${index}-${Math.random().toString(36).slice(2)}`,
    speaker: line.speakerId,
    text: line.text,
  }));
}
