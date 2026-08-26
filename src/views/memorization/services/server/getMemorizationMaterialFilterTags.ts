// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createMemorizationMaterialRepository } from "@/entities/memorization-material";

export async function getMemorizationMaterialFilterTags() {
  const supabase = await createSupabaseServerClient();

  return createMemorizationMaterialRepository(supabase).findDistinctTags();
}
