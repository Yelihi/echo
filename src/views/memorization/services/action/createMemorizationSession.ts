"use server";

import { revalidatePath } from "next/cache";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createMemorizationMaterialRepository } from "@/entities/memorization-material";
import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import type { MaterialId } from "@/entities/value-object";

// views
import {
  createMemorizationSessionInputSchema,
  createMemorizationSessionSnapshotSchema,
} from "@/views/memorization/config/schema";
import { convertMemorizationMaterialToSessionSnapshot } from "@/views/memorization/models/converter/convertMemorizationMaterialToSessionSnapshot";
import {
  MemorizationSessionCreateFailedError,
  MemorizationSessionCreateSourceMaterialNotFoundError,
  MemorizationSessionCreateUnauthorizedError,
} from "@/views/memorization/models/errors";
import type {
  CreateMemorizationSessionRequest,
  CreateMemorizationSessionResult,
} from "@/views/memorization/models/ready";

export const createMemorizationSession = async (
  input: CreateMemorizationSessionRequest,
): Promise<CreateMemorizationSessionResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: MemorizationSessionCreateUnauthorizedError.CODE };
  }

  const parsedInput = createMemorizationSessionInputSchema.safeParse({
    ownerId: user.id,
    materialId: input.materialId,
  });

  if (!parsedInput.success) {
    return { code: MemorizationSessionCreateFailedError.CODE };
  }

  try {
    const material = await createMemorizationMaterialRepository(supabase).findById(
      parsedInput.data.materialId as MaterialId,
    );

    if (!material || material.ownerId !== user.id) {
      return { code: MemorizationSessionCreateSourceMaterialNotFoundError.CODE };
    }

    const snapshot = convertMemorizationMaterialToSessionSnapshot(material);

    if (!createMemorizationSessionSnapshotSchema.safeParse(snapshot).success) {
      return { code: MemorizationSessionCreateSourceMaterialNotFoundError.CODE };
    }

    const created = await createMemorizationSessionRepository(supabase).createSession(snapshot);

    revalidatePath("/sentence-memorization");
    revalidatePath("/home");
    return { code: "SUCCESS", sessionId: created.id };
  } catch {
    return { code: MemorizationSessionCreateFailedError.CODE };
  }
};
