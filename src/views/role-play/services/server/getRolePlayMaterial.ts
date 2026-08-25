// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import {
  createRoleplayMaterialRepository,
  MaterialState,
  type RoleplayMaterial,
} from "@/entities/roleplay-material";
import type { MaterialId } from "@/entities/value-object";

export async function getRolePlayMaterial(
  materialId: MaterialId,
): Promise<RoleplayMaterial | null> {
  const supabase = await createSupabaseServerClient();
  const material = await createRoleplayMaterialRepository(supabase).findById(materialId);

  if (!material || material.state !== MaterialState.ACTIVE) {
    return null;
  }

  return material;
}
