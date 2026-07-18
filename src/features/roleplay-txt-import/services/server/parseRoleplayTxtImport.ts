import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { getOpenAIEvaluationModel, getOpenAIServerClient } from "@/shared/lib/openai/server";

import {
  RoleplayTxtImportEmptyTextError,
  RoleplayTxtImportError,
  RoleplayTxtImportInvalidOutputError,
  RoleplayTxtImportProviderFailedError,
  RoleplayTxtImportTooManySpeakersError,
  RoleplayTxtImportUnsupportedFileError,
} from "@/features/roleplay-txt-import/models/errors";
import {
  openAIRoleplayTxtImportOutputSchema,
  roleplayTxtImportDraftSchema,
  type OpenAIRoleplayTxtImportOutput,
  type RoleplayTxtImportDraft,
  type RoleplayTxtImportSpeakerId,
} from "@/features/roleplay-txt-import/models/schema";

export interface RoleplayTxtImportOpenAIClient {
  readonly responses: {
    parse(body: unknown): Promise<{ readonly output_parsed: unknown }>;
  };
}

export interface ParseRoleplayTxtImportInput {
  readonly file: File;
  readonly client?: RoleplayTxtImportOpenAIClient;
  readonly model?: string;
}

const TXT_EXTENSION_PATTERN = /\.txt$/i;

export async function parseRoleplayTxtImport(
  input: ParseRoleplayTxtImportInput,
): Promise<RoleplayTxtImportDraft> {
  assertTxtFile(input.file);

  const text = (await input.file.text()).trim();

  if (!text) {
    throw new RoleplayTxtImportEmptyTextError();
  }

  try {
    const client = input.client ?? getOpenAIServerClient();
    const model = input.model ?? getOpenAIEvaluationModel();
    const response = await client.responses.parse({
      model,
      input: [
        {
          role: "system",
          content:
            "Split a roleplay TXT script into exactly two speakers. Return only schema-valid output.",
        },
        {
          role: "user",
          content: buildPrompt(text),
        },
      ],
      text: {
        format: zodTextFormat(openAIRoleplayTxtImportOutputSchema, "roleplay_txt_import"),
      },
    });

    if (!response.output_parsed) {
      throw new RoleplayTxtImportInvalidOutputError();
    }

    return normalizeOpenAIOutput(response.output_parsed);
  } catch (error) {
    if (error instanceof RoleplayTxtImportError) {
      throw error;
    }

    throw new RoleplayTxtImportProviderFailedError({ cause: error });
  }
}

function assertTxtFile(file: File): void {
  if (!TXT_EXTENSION_PATTERN.test(file.name)) {
    throw new RoleplayTxtImportUnsupportedFileError();
  }
}

function normalizeOpenAIOutput(output: unknown): RoleplayTxtImportDraft {
  const parsed = openAIRoleplayTxtImportOutputSchema.safeParse(output);

  if (!parsed.success) {
    throw new RoleplayTxtImportInvalidOutputError({ cause: parsed.error });
  }

  const speakerBySourceName = new Map<string, RoleplayTxtImportSpeakerId>();

  for (const speaker of parsed.data.speakers) {
    speakerBySourceName.set(speaker.sourceName, speaker.role);
  }

  if (speakerBySourceName.size > 2) {
    throw new RoleplayTxtImportTooManySpeakersError();
  }

  if (speakerBySourceName.size < 2) {
    throw new RoleplayTxtImportInvalidOutputError();
  }

  const draft = {
    speakers: [createDraftSpeaker(parsed.data, "partner"), createDraftSpeaker(parsed.data, "me")],
    lines: parsed.data.lines.map((line) => {
      const speakerId = speakerBySourceName.get(line.speaker);

      if (!speakerId) {
        throw new RoleplayTxtImportInvalidOutputError();
      }

      return {
        speakerId,
        text: line.text,
        translation: line.translation,
      };
    }),
  };

  return roleplayTxtImportDraftSchema.parse(draft);
}

function createDraftSpeaker(
  output: OpenAIRoleplayTxtImportOutput,
  id: RoleplayTxtImportSpeakerId,
): RoleplayTxtImportDraft["speakers"][number] {
  const speaker = output.speakers.find((item) => item.role === id);

  if (!speaker) {
    throw new RoleplayTxtImportInvalidOutputError();
  }

  return {
    id,
    displayName: speaker.displayName,
  };
}

function buildPrompt(text: string): string {
  return [
    "Input TXT:",
    text,
    "",
    "Rules:",
    "- Detect exactly two speakers.",
    "- Map the learner/user speaker to role `me` and the conversation partner to role `partner`.",
    "- Preserve line order and original English text.",
    "- Use null for translation unless the source TXT includes a clear translation.",
  ].join("\n");
}
