import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { GetTodosParams } from "@/entities/todo";

export const todoKeys = createQueryKeys("todos", {
  all: null,
  list: (params: GetTodosParams) => ({
    queryKey: [params],
  }),
});
