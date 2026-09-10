import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
export const roleplayRecordingRequestSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.enum(["save", "finish"]),
});
export const learnerRecordingSchema = z.object({
  recordingId: z.string().uuid(),
  lineId: z.string().uuid(),
  durationMs: z.coerce.number().int().min(800).max(600_000),
});

export interface RoleplayRecordingContext {
  authClient: SupabaseClient<Database>;
  supabase: SupabaseClient<Database>;
  userId: string;
  sessionId: string;
  sessionStatus: Database["public"]["Enums"]["practice_session_status"];
}
