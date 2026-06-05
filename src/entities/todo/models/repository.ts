import type { CreateTodoRequestDto, GetTodosParams, TodoDto } from "./dtos";

export interface TodoRepository {
  getTodos(params?: GetTodosParams, options?: RequestInit): Promise<TodoDto[]>;
  createTodo(data: CreateTodoRequestDto, options?: RequestInit): Promise<TodoDto>;
}
