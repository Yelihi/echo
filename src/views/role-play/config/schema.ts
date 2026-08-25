import { z } from "zod";

export const roleplayEditorDraftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  situation: z.string().trim().min(1).max(2000),
  tags: z
    .array(z.string())
    .transform((tags) => [
      ...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
    ])
    .pipe(z.array(z.string().min(1).max(80))),
  lines: z
    .array(
      z.object({
        speaker: z.enum(["partner", "me"]),
        text: z.string(),
      }),
    )
    .transform((lines) =>
      lines
        .map((line) => ({ speaker: line.speaker, text: line.text.trim() }))
        .filter((line) => line.text.length > 0),
    )
    .pipe(
      z
        .array(
          z.object({
            speaker: z.enum(["partner", "me"]),
            text: z.string().min(1).max(2000),
          }),
        )
        .min(1),
    ),
});

export type RoleplayEditorDraftInput = z.infer<typeof roleplayEditorDraftSchema>;
