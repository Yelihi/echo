import { TodoStatus } from "../models/enums";
import type { CreateTodoRequestDto, GetTodosParams, TodoDto } from "../models/dtos";
import type { TodoRepository } from "../models/repository";

// 예시: JSONPlaceholder API를 사용합니다.
// 실제 프로젝트에서는 환경 변수(process.env.NEXT_PUBLIC_API_BASE_URL)로 대체하세요.
const BASE_URL = "https://jsonplaceholder.typicode.com";

class TodoRepositoryImpl implements TodoRepository {
  async getTodos(params?: GetTodosParams, options?: RequestInit): Promise<TodoDto[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set("_page", String(params.page));
    if (params?.limit) query.set("_limit", String(params.limit));

    const res = await fetch(`${BASE_URL}/todos?${query.toString()}`, {
      credentials: "include",
      ...options,
    });
    if (!res.ok) throw new Error("Failed to fetch todos");

    const data = (await res.json()) as Array<{ id: number; title: string; completed: boolean }>;
    return data.map((item) => ({
      ...item,
      status: item.completed ? TodoStatus.DONE : TodoStatus.TODO,
    }));
  }

  async createTodo(data: CreateTodoRequestDto, options?: RequestInit): Promise<TodoDto> {
    const res = await fetch(`${BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
      ...options,
    });
    if (!res.ok) throw new Error("Failed to create todo");

    const item = (await res.json()) as { id: number; title: string; completed: boolean };
    return { ...item, status: TodoStatus.TODO };
  }
}

export const todoRepository: TodoRepository = new TodoRepositoryImpl();
