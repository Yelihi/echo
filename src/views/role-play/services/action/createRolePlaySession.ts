"use server";

import { revalidatePath } from "next/cache";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
import type { MaterialId, SpeakerId } from "@/entities/value-object";

// views
import {
  createRoleplaySessionInputSchema,
  createRoleplaySessionSnapshotSchema,
} from "@/views/role-play/config/schema";
import { convertRolePlayMaterialToSessionSnapshot } from "@/views/role-play/models/converter/convertRolePlayMaterialToSessionSnapshot";
import {
  RolePlaySessionCreateFailedError,
  RolePlaySessionCreateSourceMaterialNotFoundError,
  RolePlaySessionCreateUnauthorizedError,
} from "@/views/role-play/models/errors";
import type {
  CreateRolePlaySessionRequest,
  CreateRolePlaySessionResult,
} from "@/views/role-play/models/interface";

export const createRolePlaySession = async (
  input: CreateRolePlaySessionRequest,
): Promise<CreateRolePlaySessionResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: RolePlaySessionCreateUnauthorizedError.CODE };
  }

  const parsedInput = createRoleplaySessionInputSchema.safeParse({
    ownerId: user.id,
    materialId: input.materialId,
    selectedLearnerSpeakerId: `${input.materialId}:speaker:${input.role === "learner" ? 2 : 1}`,
    partnerVoice: input.voice,
    speechSpeed: input.speed,
  });

  if (!parsedInput.success) {
    return { code: RolePlaySessionCreateFailedError.CODE };
  }

  try {
    const material = await createRoleplayMaterialRepository(supabase).findById(
      parsedInput.data.materialId as MaterialId,
    );

    if (!material || material.ownerId !== user.id) {
      return { code: RolePlaySessionCreateSourceMaterialNotFoundError.CODE };
    }

    const snapshot = convertRolePlayMaterialToSessionSnapshot(
      material,
      parsedInput.data.selectedLearnerSpeakerId as SpeakerId,
      {
        partnerVoice: parsedInput.data.partnerVoice,
        speechSpeed: parsedInput.data.speechSpeed,
      },
    );

    if (!createRoleplaySessionSnapshotSchema.safeParse(snapshot).success) {
      return { code: RolePlaySessionCreateSourceMaterialNotFoundError.CODE };
    }

    const created = await createRoleplaySessionRepository(supabase).createSession(snapshot);

    revalidatePath("/role-playing");
    revalidatePath("/home");
    return { code: "SUCCESS", sessionId: created.id };
  } catch {
    return { code: RolePlaySessionCreateFailedError.CODE };
  }
};
