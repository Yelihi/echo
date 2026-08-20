import type { SessionSimplifiedProps } from "@/widgets/latest-sessions/models";

export interface GetLatestRoleplaySessionsParams {
  page: number;
  limit?: number;
}

export interface GetLatestMemorizationSessionsParams {
  page: number;
  limit?: number;
}

export interface GetLatestStudySession extends SessionSimplifiedProps {
  id: string;
}
