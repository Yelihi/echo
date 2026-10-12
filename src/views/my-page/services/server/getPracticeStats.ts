import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/features/login/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/lib/supabase/database.types";
import { practiceStatsTag } from "@/shared/lib/query/practiceStatsCache";
import type { PracticeStats } from "../../models/interface";
import { loadPracticeCompletions } from "./loadPracticeCompletions";
import { koreanDay, summarizePracticeStats } from "./summarizePracticeStats";

export async function getPracticeStats(): Promise<PracticeStats | null> {
  const supabase = await createSupabaseServerClient();
  const owner = await requireUserOrRedirect(supabase);
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session || session.user.id !== owner.id) redirect("/login");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase configuration is missing");

  const now = new Date();
  const todayKst = koreanDay(now);
  const from = `${koreanDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000))}T00:00:00+09:00`;

  const read = unstable_cache(
    async () => {
      const client = createClient<Database>(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${session.access_token}` } },
      });
      return loadPracticeCompletions(client, owner.id, from, now.toISOString());
    },
    ["my-page-practice-stats", owner.id, todayKst],
    { revalidate: 60, tags: [practiceStatsTag(owner.id)] },
  );

  try {
    return summarizePracticeStats(await read(), now);
  } catch (error) {
    console.error("연습 통계 조회 실패", error);
    return null;
  }
}
