import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, expect, it, jest } from "@jest/globals";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useHistoryFilters } from "../useHistoryFilters";

const push = jest.fn();
beforeEach(() => {
  push.mockClear();
});
function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    AppRouterContext.Provider,
    {
      value: {
        push,
        replace: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn(),
      },
    },
    children,
  );
}

it("상태 변경 시 정렬은 유지하고 이전 페이지 번호는 제거한다", async () => {
  const { result } = renderHook(
    () => useHistoryFilters({ page: 5, status: "all", sort: "oldest" }),
    { wrapper },
  );
  await act(async () => result.current.changeFilter({ status: "partial" }));
  expect(push).toHaveBeenCalledWith("/sessions?status=partial&sort=oldest");
});
it("정렬 변경 시 상태 필터를 보존한다", async () => {
  const { result } = renderHook(
    () => useHistoryFilters({ page: 3, status: "failed", sort: "oldest" }),
    { wrapper },
  );
  await act(async () => result.current.changeFilter({ sort: "newest" }));
  expect(push).toHaveBeenCalledWith("/sessions?status=failed");
});
