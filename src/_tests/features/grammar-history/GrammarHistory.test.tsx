import { describe, it, expect, jest } from "@jest/globals";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GrammarHistory } from "@/features/grammar-history";
import type { GrammarHistoryResult } from "@/features/grammar-history";
import { formatGrammarPracticeDate } from "@/features/grammar-history/services/formatPracticeDate";
describe("grammar history", () => {
  it("shows Korea date across UTC midnight", () => {
    expect(formatGrammarPracticeDate("2026-10-01T16:00:00Z")).toContain("10. 02.");
  });
  it("shows completed count, loads empty history and restores focus when closing", async () => {
    const user = userEvent.setup();
    const data = { items: [], total: 0, page: 1, pageSize: 10 };
    const load = jest
      .fn<() => Promise<GrammarHistoryResult>>()
      .mockResolvedValue({ ok: true, data });
    render(<GrammarHistory noteId="note" initialData={data} load={load} />);
    expect(screen.getByText("완료한 연습 0회")).toBeVisible();
    const trigger = screen.getByRole("button", { name: "연습 기록 전체보기" });
    await user.click(trigger);
    expect(await screen.findByText("아직 완료한 연습이 없습니다.")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
  it("provides retry after failure without fabricating a count", async () => {
    const user = userEvent.setup();
    const load = jest
      .fn<() => Promise<GrammarHistoryResult>>()
      .mockResolvedValueOnce({ ok: false, code: "LOAD_FAILED" as const })
      .mockResolvedValueOnce({ ok: true, data: { items: [], total: 0, page: 1, pageSize: 10 } });
    render(<GrammarHistory noteId="note" load={load} />);
    expect(screen.queryByText("완료한 연습 0회")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "연습 기록 전체보기" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("연습 기록을 불러오지 못했습니다");
    await user.click(screen.getByRole("button", { name: "다시 불러오기" }));
    expect(await screen.findByText("아직 완료한 연습이 없습니다.")).toBeVisible();
    expect(load).toHaveBeenCalledTimes(2);
  });
});

it("discards a previous note's in-flight history when the note changes", async () => {
  let resolve!: (result: GrammarHistoryResult) => void;
  const load = jest.fn<() => Promise<GrammarHistoryResult>>().mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const data = { items: [], total: 0, page: 1, pageSize: 10 };
  const { rerender } = render(<GrammarHistory noteId="first" load={load} />);
  await userEvent.setup().click(screen.getByRole("button", { name: "연습 기록 전체보기" }));
  rerender(<GrammarHistory noteId="second" initialData={data} load={load} />);
  await act(async () => resolve({ ok: true, data: { ...data, total: 99 } }));
  expect(screen.getByText("완료한 연습 0회")).toBeVisible();
  expect(screen.queryByText("완료한 연습 99회")).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
