import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

type TestAnalysisApiAuth = {
  userId: string;
};

export function assertTestAnalysisPageEnabled(): void {
  if (isTestAnalysisEnabled()) {
    return;
  }

  notFound();
}

export function rejectDisabledTestAnalysisApi(): NextResponse | null {
  return isTestAnalysisEnabled()
    ? null
    : NextResponse.json({ error: "Test analysis API is disabled." }, { status: 404 });
}

export async function authorizeTestAnalysisApi(): Promise<
  { auth: TestAnalysisApiAuth; response: null } | { auth: null; response: NextResponse }
> {
  const disabled = rejectDisabledTestAnalysisApi();

  if (disabled) {
    return { auth: null, response: disabled };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      auth: null,
      response: NextResponse.json({ error: "Authentication is required." }, { status: 401 }),
    };
  }

  return { auth: { userId: user.id }, response: null };
}

function isTestAnalysisEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_TEST_ANALYSIS_PAGE === "true";
}
