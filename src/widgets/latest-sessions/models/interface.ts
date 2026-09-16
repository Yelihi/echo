export type LatestSessionType = "role-playing" | "memorization";
export type LatestSessionState =
  | "completed"
  | "failed"
  | "inProgress"
  | "pending"
  | "partial"
  | "practicing";

export interface SessionSimplifiedProps {
  title: string;
  sessionDate: Date;
  description: string;
  sessionType: LatestSessionType;
  sessionState: LatestSessionState;
  href?: string;
  actionLabel?: string;
  disabled?: boolean;
}
