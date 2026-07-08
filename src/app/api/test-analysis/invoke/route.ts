import { NextResponse } from "next/server";

import { rejectDisabledTestAnalysisApi } from "@/shared/lib/test-analysis/guard";

export async function POST() {
  const disabled = rejectDisabledTestAnalysisApi();

  if (disabled) {
    return disabled;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
  }

  const response = await fetch(`${url}/functions/v1/process-analysis-job`, {
    method: "POST",
    headers: {
      ...(process.env.PROCESS_ANALYSIS_SECRET
        ? { authorization: `Bearer ${process.env.PROCESS_ANALYSIS_SECRET}` }
        : {}),
    },
  });
  const text = await response.text();

  return new NextResponse(text || "{}", {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
}
