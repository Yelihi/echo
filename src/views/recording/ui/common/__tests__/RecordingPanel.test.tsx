import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordingPanel } from "../RecordingPanel";

describe("녹음 패널", () => {
  it("녹음 완료 후 원형 버튼은 다시 녹음을 실행하지 않는다", async () => {
    const toggle = jest.fn();
    render(
      <RecordingPanel
        phase="recorded"
        content={{ kind: "title", title: "Session" }}
        durationLabel="00:03"
        message="저장하세요"
        actions={{ toggle, retry: jest.fn(), save: jest.fn() }}
      />,
    );
    const orb = screen.getAllByRole("button", { name: "다시 녹음" })[0];
    expect(orb.hasAttribute("disabled")).toBe(true);
    await userEvent.click(orb);
    expect(toggle).not.toHaveBeenCalled();
  });
  it("상대방 발화가 끝난 녹음 대기 상태에서 다시 듣기를 표시한다", () => {
    render(
      <RecordingPanel
        phase="user-ready"
        content={{
          kind: "partner",
          role: "Staff",
          line: "Hello",
          canReplay: true,
          onReplay: jest.fn(),
        }}
        durationLabel="00:00"
        message="녹음하세요"
        actions={{ toggle: jest.fn(), retry: jest.fn(), save: jest.fn() }}
      />,
    );
    expect(screen.getByRole("button", { name: "다시 듣기" })).toBeTruthy();
  });
});

it("시간 초과는 한 번 알리고 저장 없이 키보드로 다시 녹음할 수 있다", async () => {
  const toggle = jest.fn();
  const user = userEvent.setup();
  render(
    <RecordingPanel
      phase="failed"
      timedOut
      content={{ kind: "title", title: "문단" }}
      durationLabel="남은 시간 00:00"
      message="시간 초과로 녹음이 삭제되었습니다."
      actions={{ toggle, retry: jest.fn(), save: jest.fn() }}
    />,
  );
  expect(screen.getByRole("alert").textContent).toContain("삭제");
  expect(screen.queryByRole("button", { name: "저장하기" })).toBeNull();
  screen.getByRole("button", { name: "다시 녹음" }).focus();
  await user.keyboard("{Enter}");
  expect(toggle).toHaveBeenCalledTimes(1);
});

it("권한 대기와 종료 처리 중에는 중복 녹음 버튼을 비활성화한다", () => {
  render(
    <RecordingPanel
      phase="user-ready"
      busy
      content={{ kind: "title", title: "문단" }}
      durationLabel="남은 시간 01:00"
      message=""
      actions={{ toggle: jest.fn(), retry: jest.fn(), save: jest.fn() }}
    />,
  );
  expect(screen.getByRole("button", { name: "녹음 시작" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByText("마이크 권한을 확인하고 있습니다.")).toBeTruthy();
});
