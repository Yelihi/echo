import {
  RoleplayTxtImportInvalidOutputError,
  RoleplayTxtImportSpeakerCountError,
} from "@/features/roleplay-txt-import/models/errors";
import {
  openAIRoleplayTxtImportOutputSchema,
  roleplayTxtImportDraftSchema,
  type OpenAIRoleplayTxtImportOutput,
  type RoleplayTxtImportDraft,
  type RoleplayTxtImportSpeakerId,
} from "@/features/roleplay-txt-import/models/schema";

export function normalizeRoleplayTxtImportOutput(output: unknown): RoleplayTxtImportDraft {
  const parsed = openAIRoleplayTxtImportOutputSchema.safeParse(output);

  if (!parsed.success) {
    throw new RoleplayTxtImportInvalidOutputError({ cause: parsed.error });
  }

  const speakerBySourceName = new Map<string, RoleplayTxtImportSpeakerId>();

  for (const speaker of parsed.data.speakers) {
    speakerBySourceName.set(speaker.sourceName, speaker.role);
  }

  if (speakerBySourceName.size !== 2) {
    throw new RoleplayTxtImportSpeakerCountError();
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
