import { NextResponse } from "next/server";

import { authorizeTestAnalysisApi } from "@/shared/lib/test-analysis/guard";

export async function POST() {
  const { response: authResponse } = await authorizeTestAnalysisApi();

  if (authResponse) {
    return authResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
  }

  const processorResponse = await fetch(`${url}/functions/v1/process-analysis-job`, {
    method: "POST",
    headers: {
      ...(process.env.PROCESS_ANALYSIS_SECRET
        ? { authorization: `Bearer ${process.env.PROCESS_ANALYSIS_SECRET}` }
        : {}),
    },
  });
  const text = await processorResponse.text();

  return new NextResponse(text || "{}", {
    status: processorResponse.status,
    headers: {
      "content-type": processorResponse.headers.get("content-type") || "application/json",
    },
  });
}
