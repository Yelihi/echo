// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";

export async function getRolePlayMaterialFilterTags() {
  const supabase = await createSupabaseServerClient();

  return createRoleplayMaterialRepository(supabase).findDistinctTags();
}
