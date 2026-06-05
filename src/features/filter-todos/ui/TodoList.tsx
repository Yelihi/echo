"use client";

import { useFilterTodos } from "../services/query/useFilterTodos";

export function TodoList() {
  const { data: todos, isPending, isError } = useFilterTodos({ limit: 10 });

  if (isPending) return <p>로딩 중...</p>;
  if (isError) return <p>데이터를 불러오지 못했습니다.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left" }}>
      {todos?.map((todo) => (
        <li
          key={todo.id}
          style={{
            padding: "0.5rem",
            borderBottom: "1px solid #eee",
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "#999" : "inherit",
          }}
        >
          {todo.title}
        </li>
      ))}
    </ul>
  );
}
