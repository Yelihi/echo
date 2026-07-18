import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { buildRoleplayTxtImportPrompt } from "@/features/roleplay-txt-import/config/prompt";
import type { RequestRoleplayTxtImportInput } from "@/features/roleplay-txt-import/models/interface";
import { openAIRoleplayTxtImportOutputSchema } from "@/features/roleplay-txt-import/models/schema";

export async function requestRoleplayTxtImport(
  input: RequestRoleplayTxtImportInput,
): Promise<unknown> {
  const response = await input.client.responses.parse({
    model: input.model,
    input: [
      {
        role: "system",
        content:
          "Split a roleplay TXT script into exactly two speakers. Return only schema-valid output.",
      },
      {
        role: "user",
        content: buildRoleplayTxtImportPrompt(input.text),
      },
    ],
    text: {
      format: zodTextFormat(openAIRoleplayTxtImportOutputSchema, "roleplay_txt_import"),
    },
  });

  return response.output_parsed;
}
