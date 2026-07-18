import type { RoleplayTxtImportDraft } from "@/features/roleplay-txt-import/models/schema";

export interface RoleplayTxtImportProps {
  readonly onImported: (draft: RoleplayTxtImportDraft) => void;
  readonly onCancel?: () => void;
}
