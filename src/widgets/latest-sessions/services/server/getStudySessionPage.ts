import "server-only";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { HistoryQuery } from "../../models/history";
import { mapHistoryPage } from "../../models/historyPage";

export async function getStudySessionPage(query: HistoryQuery) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("list_study_sessions", {
    p_page: query.page,
    p_status: query.status,
    p_sort: query.sort,
  });
  if (error) throw new Error("학습 기록을 불러오지 못했습니다.", { cause: error });
  return mapHistoryPage(data);
}
