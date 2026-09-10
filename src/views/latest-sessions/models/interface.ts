import type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";

export interface LatestSessionsViewProps {
  sessions?: readonly GetLatestStudySession[];
}
