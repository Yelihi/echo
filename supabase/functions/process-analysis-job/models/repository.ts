// @ts-expect-error Deno import map resolves this in Supabase Edge Functions.
import type { createClient } from "supabase-js";
export type Supabase = ReturnType<typeof createClient>;

export type SnapshotText = {
  id: string;
  text_snapshot: string;
};
