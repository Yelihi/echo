import type { TodoStatus } from "./enums";

export interface TodoDto {
  id: number;
  title: string;
  completed: boolean;
  status: TodoStatus;
}

export interface GetTodosParams {
  page?: number;
  limit?: number;
}

export interface CreateTodoRequestDto {
  title: string;
  completed?: boolean;
}
