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
