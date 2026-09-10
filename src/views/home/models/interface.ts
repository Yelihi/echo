export type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";

export interface GetLatestRoleplaySessionsParams {
  page: number;
  limit?: number;
}

export interface GetLatestMemorizationSessionsParams {
  page: number;
  limit?: number;
}
