"use server";

import { isUuidString } from "@/shared/utils/uuid";
import { revalidatePath } from "next/cache";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";
import type { UserId, MaterialId } from "@/entities/value-object";

// views
import { roleplayEditorDraftSchema } from "@/views/role-play/config/schema";
import { convertRolePlayEditorDraftToCreateInput } from "@/views/role-play/models/converter/convertRolePlayEditorDraft";
import {
  RolePlayMaterialInvalidError,
  RolePlayMaterialSaveFailedError,
  RolePlayMaterialUnauthorizedError,
} from "@/views/role-play/models/errors";
import type {
  CreateRolePlayMaterialResult,
  RoleplayEditorDraft,
} from "@/views/role-play/models/interface";

export const saveRolePlayMaterial = async (
  material: RoleplayEditorDraft,
  materialId?: string,
): Promise<CreateRolePlayMaterialResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { code: RolePlayMaterialUnauthorizedError.CODE };
    }

    const parsed = roleplayEditorDraftSchema.safeParse(material);

    if (!parsed.success || (materialId !== undefined && !isUuidString(materialId))) {
      return { code: RolePlayMaterialInvalidError.CODE };
    }

    const repository = createRoleplayMaterialRepository(supabase);
    const input = convertRolePlayEditorDraftToCreateInput(parsed.data, user.id as UserId);
    let savedId: string;
    if (materialId) {
      await repository.update(materialId as MaterialId, input);
      savedId = materialId;
    } else {
      savedId = (await repository.create(input)).id;
    }

    revalidatePath("/role-playing");
    return { code: "SUCCESS", materialId: savedId };
  } catch {
    return { code: RolePlayMaterialSaveFailedError.CODE };
  }
};
