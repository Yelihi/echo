import { createQueryKeys, mergeQueryKeys } from "@lukemorales/query-key-factory";

export const roleplaySessionsQueryKey = createQueryKeys("roleplay-sessions", {
  all: null,
  list: (params: { page: number; limit: number }) => [params.page, params.limit],
});

export const roleplayKeyStore = mergeQueryKeys(roleplaySessionsQueryKey);
