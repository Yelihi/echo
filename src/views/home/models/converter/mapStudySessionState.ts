import type { SessionSimplifiedProps } from "@/widgets/latest-sessions/models";

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
