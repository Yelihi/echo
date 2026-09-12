import { expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SessionTopBar } from "../SessionTopBar";

it("저장된 문장은 이어갈 수 있음을 설명하고 이탈을 취소할 수 있다", () => {
  const push = jest.fn();
  render(
    <AppRouterContext.Provider
      value={{
        push,
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn(),
      }}
    >
      <SessionTopBar close backHref="/sessions" current={2} total={10} resumable />
    </AppRouterContext.Provider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "연습 나가기" }));
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(screen.getByText(/저장한 문장은 유지되며/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "계속 연습" }));
  expect(push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "연습 나가기" }));
  fireEvent.click(screen.getByRole("button", { name: "나가기" }));
  expect(push).toHaveBeenCalledWith("/sessions");
});
