import { z } from "zod";
import { RoleplayPartnerVoice } from "@/entities/roleplay-session/models/enums";
import { isUuidString } from "@/shared/utils/uuid";
const uuidSchema = z.string().refine(isUuidString, { message: "Invalid uuid" });
const partnerVoiceSchema = z.nativeEnum(RoleplayPartnerVoice);
const speechSpeedSchema = z.number().min(0.7).max(1.3);
export const speakRolePlayPartnerLineSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("preview"),
    voice: partnerVoiceSchema,
    speed: speechSpeedSchema,
  }),
  z.object({
    mode: z.literal("session"),
    sessionId: uuidSchema,
    learnerLineId: uuidSchema.optional(),
    closing: z.boolean().optional(),
  }),
]);
