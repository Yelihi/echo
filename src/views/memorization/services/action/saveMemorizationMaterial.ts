"use server";

import { isUuidString } from "@/shared/utils/uuid";
import { revalidatePath } from "next/cache";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createMemorizationMaterialRepository } from "@/entities/memorization-material";
import type { UserId, MaterialId } from "@/entities/value-object";

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

export const saveMemorizationMaterial = async (
  material: MemorizationEditorDraft,
  materialId?: string,
): Promise<CreateMemorizationMaterialResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { code: MemorizationMaterialUnauthorizedError.CODE };
    }

    const parsed = memorizationEditorDraftSchema.safeParse(material);

    if (!parsed.success || (materialId !== undefined && !isUuidString(materialId))) {
      return { code: MemorizationMaterialInvalidError.CODE };
    }

    const repository = createMemorizationMaterialRepository(supabase);
    const input = convertMemorizationEditorDraftToCreateInput(parsed.data, user.id as UserId);
    let savedId: string;
    if (materialId) {
      await repository.update(materialId as MaterialId, input);
      savedId = materialId;
    } else {
      savedId = (await repository.create(input)).id;
    }

    revalidatePath("/sentence-memorization");
    return { code: "SUCCESS", materialId: savedId };
  } catch {
    return { code: MemorizationMaterialSaveFailedError.CODE };
  }
};
