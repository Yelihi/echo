import { z } from "zod";

export const ROLEPLAY_TXT_IMPORT_SPEAKER_IDS = ["partner", "me"] as const;

const nonEmptyTextSchema = z.string().trim().min(1);

export const roleplayTxtImportSpeakerSchema = z.object({
  id: z.enum(ROLEPLAY_TXT_IMPORT_SPEAKER_IDS),
  displayName: nonEmptyTextSchema,
});

export const roleplayTxtImportLineSchema = z.object({
  speakerId: z.enum(ROLEPLAY_TXT_IMPORT_SPEAKER_IDS),
  text: nonEmptyTextSchema,
  translation: z.string().trim().min(1).nullable().optional(),
});

export const roleplayTxtImportDraftSchema = z.object({
  speakers: z.tuple([roleplayTxtImportSpeakerSchema, roleplayTxtImportSpeakerSchema]),
  lines: z.array(roleplayTxtImportLineSchema).min(1),
});

export const openAIRoleplayTxtImportSpeakerSchema = z.object({
  sourceName: nonEmptyTextSchema,
  role: z.enum(ROLEPLAY_TXT_IMPORT_SPEAKER_IDS),
  displayName: nonEmptyTextSchema,
});

export const openAIRoleplayTxtImportOutputSchema = z.object({
  speakers: z.array(openAIRoleplayTxtImportSpeakerSchema).min(1),
  lines: z
    .array(
      z.object({
        speaker: nonEmptyTextSchema,
        text: nonEmptyTextSchema,
        translation: z.string().trim().min(1).nullable(),
      }),
    )
    .min(1),
});

export type RoleplayTxtImportSpeakerId = (typeof ROLEPLAY_TXT_IMPORT_SPEAKER_IDS)[number];
export type RoleplayTxtImportDraft = z.infer<typeof roleplayTxtImportDraftSchema>;
export type OpenAIRoleplayTxtImportOutput = z.infer<typeof openAIRoleplayTxtImportOutputSchema>;
