import { notFound } from "next/navigation";

import type { UserId } from "@/entities/value-object";
import type { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function requireUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  return { id: user.id as UserId };
}
