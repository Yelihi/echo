import { getAuthenticatedUser } from "@/shared/lib/supabase/getAuthenticatedUser";
import { notFound } from "next/navigation";

// shared
import type { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import type { UserId } from "@/entities/value-object";

export const requireUser = async (
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) => {
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    notFound();
  }

  return { id: user.id as UserId };
};
