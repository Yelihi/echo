"use client";

import { useQuery } from "@tanstack/react-query";
import { todoRepository, type GetTodosParams } from "@/entities/todo";
import { todoKeys } from "../../config/query-keys";

export function useFilterTodos(params: GetTodosParams = {}) {
  return useQuery({
    ...todoKeys.list(params),
    queryFn: () => todoRepository.getTodos(params),
    staleTime: 1000 * 60,
  });
}
