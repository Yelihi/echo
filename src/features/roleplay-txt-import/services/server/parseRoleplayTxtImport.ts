import "server-only";

import { getOpenAIEvaluationModel, getOpenAIServerClient } from "@/shared/lib/openai/server";

import {
  RoleplayTxtImportError,
  RoleplayTxtImportInvalidOutputError,
  RoleplayTxtImportProviderFailedError,
} from "@/features/roleplay-txt-import/models/errors";
import type {
  ParseRoleplayTxtImportInput,
  RoleplayTxtImportOpenAIClient,
} from "@/features/roleplay-txt-import/models/interface";
import type { RoleplayTxtImportDraft } from "@/features/roleplay-txt-import/models/schema";
import { normalizeRoleplayTxtImportOutput } from "@/features/roleplay-txt-import/services/server/normalizeRoleplayTxtImportOutput";
import { requestRoleplayTxtImport } from "@/features/roleplay-txt-import/services/server/requestRoleplayTxtImport";
import { readRoleplayTxtImportText } from "@/features/roleplay-txt-import/services/server/validation";

export type { RoleplayTxtImportOpenAIClient };

export async function parseRoleplayTxtImport(
  input: ParseRoleplayTxtImportInput,
): Promise<RoleplayTxtImportDraft> {
  const text = await readRoleplayTxtImportText(input.file);

  try {
    const output = await requestRoleplayTxtImport({
      text,
      client: input.client ?? getOpenAIServerClient(),
      model: input.model ?? getOpenAIEvaluationModel(),
    });

    if (!output) {
      throw new RoleplayTxtImportInvalidOutputError();
    }

    return normalizeRoleplayTxtImportOutput(output);
  } catch (error) {
    if (error instanceof RoleplayTxtImportError) {
      throw error;
    }

    throw new RoleplayTxtImportProviderFailedError({ cause: error });
  }
}
