"use server";

import { revalidatePath } from "next/cache";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createMemorizationMaterialRepository } from "@/entities/memorization-material";
import type { UserId } from "@/entities/value-object";

// views
import { memorizationEditorDraftSchema } from "@/views/memorization/config/schema";
import { convertMemorizationEditorDraftToCreateInput } from "@/views/memorization/models/converter/convertMemorizationEditorDraft";
import type {
  CreateMemorizationMaterialResult,
  MemorizationEditorDraft,
} from "@/views/memorization/models/editor";
import {
  MemorizationMaterialInvalidError,
  MemorizationMaterialSaveFailedError,
  MemorizationMaterialUnauthorizedError,
} from "@/views/memorization/models/errors";

export const createMemorizationMaterial = async (
  material: MemorizationEditorDraft,
): Promise<CreateMemorizationMaterialResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: MemorizationMaterialUnauthorizedError.CODE };
  }

  const parsed = memorizationEditorDraftSchema.safeParse(material);

  if (!parsed.success) {
    return { code: MemorizationMaterialInvalidError.CODE };
  }

  try {
    const created = await createMemorizationMaterialRepository(supabase).create(
      convertMemorizationEditorDraftToCreateInput(parsed.data, user.id as UserId),
    );

    revalidatePath("/sentence-memorization");
    return { code: "SUCCESS", materialId: created.id };
  } catch {
    return { code: MemorizationMaterialSaveFailedError.CODE };
  }
};
