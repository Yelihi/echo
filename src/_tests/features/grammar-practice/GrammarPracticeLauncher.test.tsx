import { describe, it, expect, jest, beforeAll } from "@jest/globals";
import type { GrammarPracticeLauncherProps } from "@/features/grammar-practice";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GrammarPracticeLauncher } from "@/features/grammar-practice";

import { recallSession } from "@/_tests/features/grammar-recall/fixture";

describe("grammar practice launch", () => {
  let sequence = 0;

  beforeAll(() => {
    Object.defineProperty(crypto, "randomUUID", {
      value: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`,

      configurable: true,
    });
  });

  it("reuses the request id on a failed start and keeps resume separate", async () => {
    const onStart = jest
      .fn<GrammarPracticeLauncherProps["onStart"]>()
      .mockResolvedValue({ ok: false, code: "FAILED" as const });
    const onOpen = jest.fn();

    render(
      <GrammarPracticeLauncher
        noteId="note"
        activeSessions={{ recall: "active" }}
        onStart={onStart}
        onOpen={onOpen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "암기 연습 이어하기" }));
    expect(onOpen).toHaveBeenCalledWith("active");
    expect(onStart).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "암기 연습 새로 시작" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "암기 연습 새로 시작" }));
    await waitFor(() => expect(onStart).toHaveBeenCalledTimes(2));
    expect(onStart.mock.calls[0][0].requestId).toBe(onStart.mock.calls[1][0].requestId);
  });

  it("uses a new request after a successful start in a restored launcher", async () => {
    const onStart = jest
      .fn<GrammarPracticeLauncherProps["onStart"]>()
      .mockResolvedValue({ ok: true, data: recallSession() });
    const onOpen = jest.fn();

    render(
      <GrammarPracticeLauncher
        noteId="note"
        activeSessions={{}}
        onStart={onStart}
        onOpen={onOpen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "암기 연습 새로 시작" }));
    await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "암기 연습 새로 시작" }));
    await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(2));
    expect(onStart.mock.calls[0][0].requestId).not.toBe(onStart.mock.calls[1][0].requestId);
  });
});
