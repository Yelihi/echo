import { Profiler } from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PracticeMobileMenu } from "@/widgets/app-shell/ui/PracticeMobileMenu";

describe("practice mobile navigation", () => {
  it("opens and closes without rendering surrounding content and restores trigger focus", async () => {
    const surrounding = jest.fn();
    render(
      <>
        <Profiler id="page" onRender={surrounding}>
          <p>학습 내용</p>
        </Profiler>
        <PracticeMobileMenu pathname="/role-playing/new" base="/role-playing" mode="롤플레잉" />
      </>,
    );
    surrounding.mockClear();
    const trigger = screen.getByRole("button", { name: "메뉴 열기" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Echo 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "새 자료 만들기" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(surrounding).not.toHaveBeenCalled();
  });
});
