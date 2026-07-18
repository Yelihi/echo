import type { RoleplayTxtImportDraft } from "@/features/roleplay-txt-import/models/schema";

export interface RoleplayTxtImportOpenAIClient {
  readonly responses: {
    parse(body: unknown): Promise<{ readonly output_parsed: unknown }>;
  };
}

export interface RequestRoleplayTxtImportInput {
  readonly client: RoleplayTxtImportOpenAIClient;
  readonly model: string;
  readonly text: string;
}

export interface ParseRoleplayTxtImportInput {
  readonly file: File;
  readonly client?: RoleplayTxtImportOpenAIClient;
  readonly model?: string;
}

export interface RoleplayTxtImportProps {
  readonly onImported: (draft: RoleplayTxtImportDraft) => void;
  readonly onCancel?: () => void;
}
