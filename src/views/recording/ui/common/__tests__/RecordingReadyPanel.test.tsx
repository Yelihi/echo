import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordingReadyPanel } from "../RecordingReadyPanel";

describe("녹음 전 미리보기", () => {
  it("미리보기를 열고 닫아도 세션은 시작되지 않으며 시작 버튼만 세션을 시작한다", async () => {
    const user = userEvent.setup();
    const onStart = jest.fn();
    render(
      <RecordingReadyPanel
        onStart={onStart}
        content={{
          label: "롤플레잉",
          title: "카페에서 주문하기",
          description: [],
          meta: [],
          previewLabel: "문장 미리 보기",
          previewLines: [{ label: "나", text: "A latte, please." }],
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "문장 미리 보기" }));
    expect(within(screen.getByRole("dialog")).getByText("A latte, please.")).toBeTruthy();
    expect(onStart).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onStart).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "시작하기" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
