"use server";
import { revalidatePath } from "next/cache";
import { isUuidString } from "@/shared/utils/uuid";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";
import type { MaterialId, UserId } from "@/entities/value-object";

export async function deleteRolePlayMaterial(id: string): Promise<boolean> {
  if (!isUuidString(id)) return false;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    await createRoleplayMaterialRepository(supabase).softDelete(
      id as MaterialId,
      user.id as UserId,
    );
    revalidatePath("/role-playing");
    revalidatePath("/my-page");
    return true;
  } catch {
    return false;
  }
}
