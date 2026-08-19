import { useQuery } from "@tanstack/react-query";

// entities
import { RoleplaySessionRepositoryPort } from "@/entities/roleplay-session";

// features
import { roleplayKeyStore } from "@/features/roleplay-sessions/config/query-key";
import type { GetRoleplaySessionsParams } from "@/features/roleplay-sessions/models/interface";

export const useGetRoleplaySessions = (
  repository: RoleplaySessionRepositoryPort,
  params: GetRoleplaySessionsParams,
) => {
  return useQuery({
    ...roleplayKeyStore["roleplay-sessions"].list({ page: params.page, limit: params.limit ?? 10 }),
    queryFn: () =>
      repository.findMany({
        page: params.page,
        limit: params.limit ?? 10,
      }),
  });
};
