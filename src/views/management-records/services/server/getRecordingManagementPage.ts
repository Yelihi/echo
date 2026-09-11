import "server-only";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { convertManagedRecording } from "../../models/converter/convertManagedRecording";
import type { RecordsSummary, RecordStatus } from "../../models/interface";
import { RECORDING_MANAGEMENT_PAGE_SIZE, type RecordingManagementQuery } from "../../models/query";

export async function getRecordingManagementPage(query: RecordingManagementQuery) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("로그인이 필요합니다.");

  const countStatus = async (status: RecordStatus) => {
    const { count, error } = await supabase
      .from("recording_management_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", status);
    if (error) throw new Error(`Failed to count recordings: ${error.message}`);
    return count ?? 0;
  };
  const [connected, orphaned, failDelete] = await Promise.all([
    countStatus("connected"),
    countStatus("orphaned"),
    countStatus("delete-failed"),
  ]);
  const recordsSummary: RecordsSummary = {
    total: connected + orphaned + failDelete,
    connected,
    orphaned,
    failDelete,
  };
  const counts = { all: recordsSummary.total, connected, orphaned, "delete-failed": failDelete };
  const totalCount = counts[query.status];
  const pageSize = RECORDING_MANAGEMENT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(query.page, totalPages);
  let request = supabase.from("recording_management_records").select("*").eq("user_id", user.id);
  if (query.status !== "all") request = request.eq("status", query.status);
  const { data, error } = await request
    .order("created_at", { ascending: query.sort === "oldest" })
    .order("id", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error(`Failed to list recordings: ${error.message}`);
  return {
    records: (data ?? []).map(convertManagedRecording),
    recordsSummary,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
