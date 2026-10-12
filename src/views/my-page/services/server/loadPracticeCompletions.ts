import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
import type { PracticeCompletion, PracticeCompletionSource } from "../../models/interface";
import { PracticeStatsLoadError } from "../../models/errors";

const sources: readonly PracticeCompletionSource[] = [
  { kind: "roleplay", table: "roleplay_sessions" },
  { kind: "memorization", table: "memorization_sessions" },
  { kind: "grammar", table: "grammar_sessions" },
];

function ownerQuery(
  client: SupabaseClient<Database>,
  source: PracticeCompletionSource,
  ownerId: string,
) {
  switch (source.table) {
    case "roleplay_sessions":
      return client.from("roleplay_sessions").select("id,completed_at").eq("user_id", ownerId);
    case "memorization_sessions":
      return client.from("memorization_sessions").select("id,completed_at").eq("user_id", ownerId);
    case "grammar_sessions":
      return client.from("grammar_sessions").select("id,completed_at").eq("owner_id", ownerId);
  }
}

export async function loadPracticeCompletions(
  client: SupabaseClient<Database>,
  ownerId: string,
  from: string,
  to: string,
): Promise<PracticeCompletion[]> {
  const pages = await Promise.all(
    sources.map(async (source) => {
      const completions: PracticeCompletion[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await ownerQuery(client, source, ownerId)
          .eq("status", "completed")
          .gte("completed_at", from)
          .lte("completed_at", to)
          .order("completed_at", { ascending: true })
          .order("id", { ascending: true })
          .range(offset, offset + 999);
        if (error) throw new PracticeStatsLoadError(error);
        for (const row of data ?? []) {
          if (row.completed_at)
            completions.push({ kind: source.kind, completedAt: row.completed_at });
        }
        if (!data || data.length < 1000) return completions;
      }
    }),
  );
  return pages.flat();
}
