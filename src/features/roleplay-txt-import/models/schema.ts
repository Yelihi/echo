import { z } from "zod";

import { ROLEPLAY_TXT_IMPORT_SPEAKER_IDS } from "@/features/roleplay-txt-import/config/const";

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

/**
 * OpenAI strict json_schema 는 루트가 object 여야 합니다.
 * discriminatedUnion 은 anyOf 루트라 요청이 전부 실패합니다.
 * invalid_input 일 때는 speakers/lines 를 빈 배열로 둡니다.
 */
export const openAIRoleplayTxtImportOutputSchema = z.object({
  status: z.enum(["ok", "invalid_input"]),
  speakers: z.array(openAIRoleplayTxtImportSpeakerSchema),
  lines: z.array(
    z.object({
      speaker: nonEmptyTextSchema,
      text: nonEmptyTextSchema,
      translation: z.string().trim().min(1).nullable(),
    }),
  ),
});

export type RoleplayTxtImportSpeakerId = (typeof ROLEPLAY_TXT_IMPORT_SPEAKER_IDS)[number];
export type RoleplayTxtImportDraft = z.infer<typeof roleplayTxtImportDraftSchema>;
export type OpenAIRoleplayTxtImportOutput = z.infer<typeof openAIRoleplayTxtImportOutputSchema>;
