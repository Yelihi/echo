"use server";
import { revalidatePath } from "next/cache";
import { isUuidString } from "@/shared/utils/uuid";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { createMemorizationMaterialRepository } from "@/entities/memorization-material";
import type { MaterialId, UserId } from "@/entities/value-object";

export async function deleteMemorizationMaterial(id: string): Promise<boolean> {
  if (!isUuidString(id)) return false;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    await createMemorizationMaterialRepository(supabase).softDelete(
      id as MaterialId,
      user.id as UserId,
    );
    revalidatePath("/sentence-memorization");
    return true;
  } catch {
    return false;
  }
}
