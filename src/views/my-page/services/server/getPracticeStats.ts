import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/features/login/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/lib/supabase/database.types";
import type { PracticeCompletion, PracticeStats } from "../../models/interface";

const dayMs = 24 * 60 * 60 * 1000;
const koreanDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function koreanDay(date: Date) {
  const parts = Object.fromEntries(
    koreanDateFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function weekStart(day: string) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

export function summarizePracticeStats(
  completions: PracticeCompletion[],
  now: Date,
): PracticeStats {
  const end = koreanDay(now);
  const startDate = new Date(`${end}T00:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - 29);
  const start = startDate.toISOString().slice(0, 10);
  const weeks = new Map<string, PracticeStats["weeks"][number]>();

  for (let time = startDate.getTime(); time <= Date.parse(`${end}T00:00:00Z`); time += dayMs) {
    const startsOn = weekStart(new Date(time).toISOString().slice(0, 10));
    if (!weeks.has(startsOn))
      weeks.set(startsOn, { startsOn, roleplay: 0, memorization: 0, grammar: 0 });
  }

  let total = 0;
  for (const completion of completions) {
    const timestamp = Date.parse(completion.completedAt);
    if (!Number.isFinite(timestamp) || timestamp > now.getTime()) continue;
    const day = koreanDay(new Date(timestamp));
    if (day < start || day > end) continue;
    const week = weeks.get(weekStart(day));
    if (!week) continue;
    week[completion.kind] += 1;
    total += 1;
  }
  return { total, weeks: [...weeks.values()] };
}

async function loadCompletions(
  client: SupabaseClient<Database>,
  kind: PracticeCompletion["kind"],
  ownerId: string,
  from: string,
  to: string,
): Promise<PracticeCompletion[]> {
  const completions: PracticeCompletion[] = [];

  for (let offset = 0; ; offset += 1000) {
    const ownerQuery =
      kind === "grammar"
        ? client.from("grammar_sessions").select("id,completed_at").eq("owner_id", ownerId)
        : kind === "roleplay"
          ? client.from("roleplay_sessions").select("id,completed_at").eq("user_id", ownerId)
          : client.from("memorization_sessions").select("id,completed_at").eq("user_id", ownerId);
    const { data, error } = await ownerQuery
      .eq("status", "completed")
      .gte("completed_at", from)
      .lte("completed_at", to)
      .order("completed_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + 999);
    if (error) throw new Error("연습 통계를 불러오지 못했습니다.", { cause: error });
    for (const row of data ?? []) {
      if (row.completed_at) completions.push({ kind, completedAt: row.completed_at });
    }
    if (!data || data.length < 1000) return completions;
  }
}

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
  const end = koreanDay(now);
  const firstDay = new Date(`${end}T00:00:00Z`);
  firstDay.setUTCDate(firstDay.getUTCDate() - 29);
  const from = `${firstDay.toISOString().slice(0, 10)}T00:00:00+09:00`;

  const read = unstable_cache(
    async () => {
      const client = createClient<Database>(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${session.access_token}` } },
      });
      const pages = await Promise.all(
        (["roleplay", "memorization", "grammar"] as const).map((kind) =>
          loadCompletions(client, kind, owner.id, from, now.toISOString()),
        ),
      );
      return pages.flat();
    },
    ["my-page-practice-stats", owner.id, end],
    { revalidate: 60 },
  );

  try {
    return summarizePracticeStats(await read(), now);
  } catch {
    return null;
  }
}
