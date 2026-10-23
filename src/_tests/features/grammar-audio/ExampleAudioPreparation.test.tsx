import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ExampleAudioPreparation } from "@/features/grammar-example-generation/ui/ExampleAudioPreparation";
import type { AudioPreparationResult, ExampleAudioCommand } from "@/entities/grammar-audio";

import { errorPopupManager, useErrorPopupStore } from "@/shared/lib/error-popup";

type Action = (input: ExampleAudioCommand) => Promise<AudioPreparationResult>;
const result = (
  status: "queued" | "ready" | "retryable",
  sentenceId = "example",
): AudioPreparationResult => ({ ok: true, data: [{ sentenceId, status }] });
afterEach(() => {
  jest.useRealTimers();
  errorPopupManager.close();
});
describe("audio status lifecycle", () => {
  it.each([
    ["NOT_INVITED", "이 계정은 AI 음성 기능을 사용할 권한이 없어요."],
    ["RATE_LIMITED", "음성 생성 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요."],
  ])(
    "job-errors: %s remains visible after polling without automatic retries or popups",
    async (code, message) => {
      jest.useFakeTimers();
      const read = jest.fn<Action>().mockResolvedValue({
        ok: true,
        data: [{ sentenceId: "example", status: "retryable", code, operationId: "job-trace" }],
      });
      const retry = jest.fn<Action>();
      render(
        <ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry} />,
      );
      await act(async () => {});
      expect(screen.getByRole("status")).toHaveTextContent(message);
      expect(screen.getByText("문의 번호: job-trace")).toBeVisible();
      await act(async () => {
        jest.advanceTimersByTime(12000);
      });
      expect(read).toHaveBeenCalledTimes(1);
      expect(retry).not.toHaveBeenCalled();
      expect(useErrorPopupStore.getState().popup).toBeNull();
    },
  );
  it("a2-cleanup: polls every 3 seconds only while active, then stops", async () => {
    jest.useFakeTimers();
    const read = jest
      .fn<Action>()
      .mockResolvedValueOnce(result("queued"))
      .mockResolvedValue(result("ready"));
    const retry = jest.fn<Action>();
    render(
      <ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry}>
        <button>재생</button>
      </ExampleAudioPreparation>,
    );
    await act(async () => {});
    expect(read).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("button", { name: "재생" })).toBeVisible();
    await act(async () => {
      jest.advanceTimersByTime(12000);
    });
    expect(read).toHaveBeenCalledTimes(2);
    expect(retry).not.toHaveBeenCalled();
  });
  it("shows a queued worker warning while continuing read-only polling until ready", async () => {
    jest.useFakeTimers();
    const read = jest
      .fn<Action>()
      .mockResolvedValueOnce({
        ok: true,
        data: [
          {
            sentenceId: "example",
            status: "queued",
            code: "PROCESSOR_UNAVAILABLE",
            operationId: "worker-trace",
          },
        ],
      })
      .mockResolvedValue(result("ready"));
    const retry = jest.fn<Action>();
    render(
      <ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry} />,
    );
    await act(async () => {});
    expect(screen.getByRole("status")).toHaveTextContent("음성 생성 서버에 연결하지 못했어요.");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("음성 준비 완료");
    expect(screen.queryByText("문의 번호: worker-trace")).not.toBeInTheDocument();
    expect(read).toHaveBeenCalledTimes(2);
    expect(retry).not.toHaveBeenCalled();
    expect(useErrorPopupStore.getState().popup).toBeNull();
  });
  it("ignores an old target's late response and clears polling on unmount", async () => {
    jest.useFakeTimers();
    let resolve!: (result: AudioPreparationResult) => void;
    const read = jest
      .fn<Action>()
      .mockReturnValueOnce(
        new Promise((r) => {
          resolve = r;
        }),
      )
      .mockResolvedValue(result("queued", "new"));
    const retry = jest.fn<Action>();
    const view = render(
      <ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry} />,
    );
    view.rerender(
      <ExampleAudioPreparation noteId="note" sentenceId="new" read={read} retry={retry} />,
    );
    await act(async () => {
      resolve(result("ready"));
    });
    expect(screen.queryByText("음성 준비 완료")).not.toBeInTheDocument();
    view.unmount();
    await act(async () => {
      jest.advanceTimersByTime(12000);
    });
    expect(read).toHaveBeenCalledTimes(2);
    expect(retry).not.toHaveBeenCalled();
  });
  it("a1-register: terminal failure does not retry until the user clicks", async () => {
    jest.useFakeTimers();
    const read = jest.fn<Action>().mockResolvedValue(result("retryable"));
    const retry = jest.fn<Action>().mockResolvedValue(result("queued"));
    render(
      <ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry} />,
    );
    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    expect(read).toHaveBeenCalledTimes(1);
    expect(retry).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "음성 준비 재시도" }));
    });
    expect(retry).toHaveBeenCalledTimes(1);
    expect(retry).toHaveBeenCalledWith({ noteId: "note", sentenceIds: ["example"] });
  });
  it("ignores a late retry failure after switching to another sentence", async () => {
    let finish!: (value: AudioPreparationResult) => void;
    const read = jest
      .fn<Action>()
      .mockResolvedValueOnce(result("retryable"))
      .mockResolvedValue(result("ready", "new"));
    const retry = jest.fn<Action>().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const view = render(
      <ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "음성 준비 재시도" }));
    expect(screen.getByRole("button", { name: "요청 중…" })).toBeDisabled();
    view.rerender(
      <ExampleAudioPreparation noteId="note" sentenceId="new" read={read} retry={retry} />,
    );
    await act(async () => {
      finish({ ok: false, code: "FAILED", operationId: "old-request" });
    });
    expect(screen.getByRole("status")).toHaveTextContent("음성 준비 완료");
    expect(screen.queryByText(/old-request/)).not.toBeInTheDocument();
    expect(useErrorPopupStore.getState().popup).toBeNull();
  });
  it("stops on read errors and rechecks without creating audio", async () => {
    jest.useFakeTimers();
    const read = jest
      .fn<Action>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(result("ready"));
    const retry = jest.fn<Action>();
    render(
      <ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry} />,
    );
    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    expect(read).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "상태 다시 확인" }));
    });
    expect(screen.getByText("음성 준비 완료")).toBeVisible();
    expect(retry).not.toHaveBeenCalled();
  });
});

it("수동 상태 조회는 진행 상태와 오류 팝업을 표시하고 자동 조회 실패는 팝업을 반복하지 않는다", async () => {
  const failure: AudioPreparationResult = { ok: false, code: "FAILED" };
  let finish!: (value: AudioPreparationResult) => void;
  const read = jest
    .fn<Action>()
    .mockResolvedValueOnce(failure)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  const retry = jest.fn<Action>();
  render(<ExampleAudioPreparation noteId="note" sentenceId="example" read={read} retry={retry} />);
  const button = await screen.findByRole("button", { name: "상태 다시 확인" });
  expect(useErrorPopupStore.getState().popup).toBeNull();
  fireEvent.click(button);
  expect(await screen.findByRole("button", { name: "확인 중…" })).toBeDisabled();
  await act(async () => {
    finish(failure);
  });
  expect(useErrorPopupStore.getState().popup?.title).toBe("음성 상태를 확인하지 못했습니다");
  expect(screen.getByRole("button", { name: "상태 다시 확인" })).toBeEnabled();
  expect(read).toHaveBeenCalledTimes(2);
  expect(retry).not.toHaveBeenCalled();
});
