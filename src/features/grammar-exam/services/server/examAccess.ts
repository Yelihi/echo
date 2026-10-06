import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { GrammarSessionError, GrammarSessionRepository } from "@/entities/grammar-session";
import { GrammarExamError } from "../../models/errors";
export async function createExamAccess() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new GrammarSessionError("UNAUTHORIZED");
  return { supabase, repository: new GrammarSessionRepository(supabase) };
}
/** 비용이 드는 외부 호출 직전에만 한도를 소비합니다. 저장/재개에는 소비하지 않습니다. */
export async function consumeExamRequest(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("consume_ai_request", { p_operation: "analysis" });
  if (error) throw new GrammarExamError("FAILED");
  if (data === "not_invited") throw new GrammarExamError("NOT_INVITED");
  if (data === "rate_limited") throw new GrammarExamError("RATE_LIMITED");
  if (data !== "allowed") throw new GrammarExamError("FAILED");
}
