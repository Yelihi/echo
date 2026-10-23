import "server-only";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/lib/supabase/database.types";

export async function getPrivateGrammarCacheClient() {
  const supabase = await createSupabaseServerClient();
  const [{ data, error }, sessionResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  const ownerId = data.user?.id;
  const session = sessionResult.data.session;

  if (error || sessionResult.error || !ownerId || !session || session.user.id !== ownerId) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase configuration is missing");

  return {
    ownerId,
    client: createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    }),
  };
}

export function invalidateGrammarDetail(noteId: string) {
  try {
    revalidatePath(`/grammar/${noteId}`);
    revalidatePath("/grammar");
  } catch (error) {
    console.error("어법 상세 캐시 무효화 실패", error);
  }
}
