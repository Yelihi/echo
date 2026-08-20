import type { SessionSimplifiedProps } from "@/widgets/latest-sessions/models";
import { AnalysisJobState } from "@/entities/analysis-job";

export function mapStudySessionState(
  state: "ready" | "in_progress" | "completed" | "deleted",
): SessionSimplifiedProps["sessionState"] {
  if (state === "completed") {
    return "completed";
  }

  if (state === "in_progress") {
    return "inProgress";
  }

  return "pending";
}

export function mapAnalysisJobState(
  state: AnalysisJobState | null,
): SessionSimplifiedProps["sessionState"] {
  if (state === AnalysisJobState.COMPLETED) {
    return "completed";
  }

  if (state === AnalysisJobState.QUEUED || state === AnalysisJobState.PROCESSING) {
    return "inProgress";
  }

  if (state === AnalysisJobState.FAILED || state === AnalysisJobState.CANCELED) {
    return "failed";
  }

  return "pending";
}
