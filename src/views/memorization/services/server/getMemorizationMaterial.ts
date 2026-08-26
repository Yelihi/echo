// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import {
  createMemorizationMaterialRepository,
  MaterialState,
  type MemorizationMaterial,
} from "@/entities/memorization-material";
import type { MaterialId } from "@/entities/value-object";

export async function getMemorizationMaterial(
  materialId: MaterialId,
): Promise<MemorizationMaterial | null> {
  const supabase = await createSupabaseServerClient();
  const material = await createMemorizationMaterialRepository(supabase).findById(materialId);

  if (!material || material.state !== MaterialState.ACTIVE) {
    return null;
  }

  return material;
}
