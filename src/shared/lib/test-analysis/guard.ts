import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

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

function isTestAnalysisEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_TEST_ANALYSIS_PAGE === "true";
}
