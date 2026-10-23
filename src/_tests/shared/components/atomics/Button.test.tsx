import Link from "next/link";
import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/shared/components/atomics/button/Button";

test("loading keeps the action name, prevents duplicate clicks, and releases after completion", () => {
  const onClick = jest.fn();
  const { rerender } = render(
    <Button loading onClick={onClick}>
      저장 중…
    </Button>,
  );
  const button = screen.getByRole("button", { name: "저장 중…" });
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(button).toBeDisabled();
  expect(button.querySelector("svg")).toHaveClass("animate-spin", "motion-reduce:animate-none");
  fireEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
  rerender(<Button onClick={onClick}>저장</Button>);
  expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
  expect(button.querySelector("svg")).toBeNull();
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("disabled alone does not imply loading, and slotted links keep their semantics", () => {
  const { rerender } = render(<Button disabled>저장</Button>);
  expect(screen.getByRole("button").querySelector("svg")).toBeNull();
  rerender(
    <Button asChild>
      <Link href="/grammar">노트로</Link>
    </Button>,
  );
  expect(screen.getByRole("link", { name: "노트로" })).toHaveAttribute("href", "/grammar");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
