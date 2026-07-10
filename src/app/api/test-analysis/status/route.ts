import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { authorizeTestAnalysisApi } from "@/shared/lib/test-analysis/guard";

export async function GET(request: Request) {
  const { auth, response } = await authorizeTestAnalysisApi();

  if (response) {
    return response;
  }

  const jobId = new URL(request.url).searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const [job, results] = await Promise.all([
    supabase.from("analysis_jobs").select("*").eq("id", jobId).maybeSingle(),
    supabase
      .from("practice_target_analysis_results")
      .select("*")
      .eq("analysis_job_id", jobId)
      .order("created_at", { ascending: true }),
  ]);

  if (job.error) {
    return NextResponse.json({ error: job.error.message }, { status: 500 });
  }

  if (job.data && job.data.user_id !== auth.userId) {
    return NextResponse.json(
      { error: "Cannot read another user's analysis job." },
      { status: 403 },
    );
  }

  if (results.error) {
    return NextResponse.json({ error: results.error.message }, { status: 500 });
  }

  return NextResponse.json({ job: job.data, results: results.data });
}
