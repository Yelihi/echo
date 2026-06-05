"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoRepository, type CreateTodoRequestDto } from "@/entities/todo";
import { todoKeys } from "@/features/filter-todos";

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequestDto) => todoRepository.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys._def });
    },
  });
}
