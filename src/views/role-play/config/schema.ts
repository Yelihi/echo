import { z } from "zod";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import { MaterialState } from "@/entities/roleplay-material";

const uuidSchema = z.string().refine(isUuidString, { message: "Invalid uuid" });

const speakerIdSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:speaker:[12]$/i, {
    message: "Invalid speaker id",
  });

const speakerOrderSchema = z.union([z.literal(1), z.literal(2)]);

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

export const createRoleplaySessionInputSchema = z
  .object({
    ownerId: uuidSchema,
    materialId: uuidSchema,
    selectedLearnerSpeakerId: speakerIdSchema,
  })
  .superRefine((input, context) => {
    const expectedPrefix = `${input.materialId}:speaker:`;

    if (!input.selectedLearnerSpeakerId.toLowerCase().startsWith(expectedPrefix.toLowerCase())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedLearnerSpeakerId"],
        message: "Speaker must belong to the material",
      });
    }
  });

export type CreateRoleplaySessionInputParsed = z.infer<typeof createRoleplaySessionInputSchema>;

const roleplaySessionSnapshotSpeakerSchema = z.object({
  id: speakerIdSchema,
  order: speakerOrderSchema,
  displayName: z.string().trim().min(1).max(80),
});

const roleplaySessionSnapshotLineSchema = z.object({
  id: uuidSchema,
  order: z.number().int().min(0),
  speakerId: speakerIdSchema,
  text: z.string().trim().min(1).max(2000),
  translation: z.string().trim().min(1).max(2000).nullable(),
});

const roleplaySessionSnapshotMaterialSchema = z.object({
  id: uuidSchema,
  ownerId: uuidSchema,
  title: z.string().trim().min(1).max(120),
  situation: z.string().trim().min(1).max(2000),
  tags: z.array(
    z.object({
      displayName: z.string().trim().min(1).max(80),
      normalizedName: z.string().trim().min(1).max(80),
    }),
  ),
  speakers: z.tuple([roleplaySessionSnapshotSpeakerSchema, roleplaySessionSnapshotSpeakerSchema]),
  lines: z.array(roleplaySessionSnapshotLineSchema).min(1),
  state: z.literal(MaterialState.ACTIVE),
  deletedAt: z.null(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createRoleplaySessionSnapshotSchema = z
  .object({
    material: roleplaySessionSnapshotMaterialSchema,
    selectedLearnerSpeakerId: speakerIdSchema,
  })
  .superRefine((snapshot, context) => {
    const [speakerOne, speakerTwo] = snapshot.material.speakers;
    const speakerIds = new Set([speakerOne.id, speakerTwo.id]);

    if (speakerOne.order !== 1 || speakerTwo.order !== 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["material", "speakers"],
        message: "Speakers must be ordered as 1 then 2",
      });
    }

    if (speakerOne.id.toLowerCase() !== `${snapshot.material.id}:speaker:1`.toLowerCase()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["material", "speakers", 0, "id"],
        message: "Speaker 1 id must match the material",
      });
    }

    if (speakerTwo.id.toLowerCase() !== `${snapshot.material.id}:speaker:2`.toLowerCase()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["material", "speakers", 1, "id"],
        message: "Speaker 2 id must match the material",
      });
    }

    if (!speakerIds.has(snapshot.selectedLearnerSpeakerId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedLearnerSpeakerId"],
        message: "Learner speaker must be one of the material speakers",
      });
    }

    snapshot.material.lines.forEach((line, index) => {
      if (!speakerIds.has(line.speakerId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["material", "lines", index, "speakerId"],
          message: "Line speaker must belong to the material",
        });
      }
    });
  });

export type CreateRoleplaySessionSnapshotParsed = z.infer<
  typeof createRoleplaySessionSnapshotSchema
>;
