"use server";

import { revalidatePath } from "next/cache";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";
import type { UserId } from "@/entities/value-object";

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

export const createRolePlayMaterial = async (
  material: RoleplayEditorDraft,
): Promise<CreateRolePlayMaterialResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: RolePlayMaterialUnauthorizedError.CODE };
  }

  const parsed = roleplayEditorDraftSchema.safeParse(material);

  if (!parsed.success) {
    return { code: RolePlayMaterialInvalidError.CODE };
  }

  try {
    const created = await createRoleplayMaterialRepository(supabase).create(
      convertRolePlayEditorDraftToCreateInput(parsed.data, user.id as UserId),
    );

    revalidatePath("/role-playing");
    return { code: "SUCCESS", materialId: created.id };
  } catch {
    return { code: RolePlayMaterialSaveFailedError.CODE };
  }
};
