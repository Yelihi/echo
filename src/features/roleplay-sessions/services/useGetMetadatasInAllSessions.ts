import { useQuery } from "@tanstack/react-query";

// entities
import { RoleplaySessionRepositoryPort } from "@/entities/roleplay-session";

// features
import { roleplayKeyStore } from "@/features/roleplay-sessions/config/query-key";

export const useGetMetadatasInAllSessions = (repository: RoleplaySessionRepositoryPort) => {
  const {
    data: metadataAllSessions,
    isLoading,
    error,
  } = useQuery({
    ...roleplayKeyStore["roleplay-sessions"].all,
    queryFn: () => repository.getAllSessionsMetadata(),
  });

  return { metadataAllSessions, isLoading, error };
};
