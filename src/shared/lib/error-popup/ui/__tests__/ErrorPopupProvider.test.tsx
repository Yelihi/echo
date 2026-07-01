import { afterEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { errorPopupManager } from "@/shared/lib/error-popup/model/store";
import { ErrorPopupProvider } from "@/shared/lib/error-popup/ui/ErrorPopupProvider";

describe("ErrorPopupProvider", () => {
  afterEach(() => {
    errorPopupManager.close();
  });

  it("renders the current error popup and closes it only from the confirm button", async () => {
    const user = userEvent.setup();
    render(<ErrorPopupProvider />);

    act(() => {
      errorPopupManager.open({
        title: "로그아웃 실패",
        message: "잠시 후 다시 시도해 주세요.",
        code: "AUTH-001",
      });
    });

    expect(await screen.findByRole("alertdialog", { name: "로그아웃 실패" })).not.toBeNull();
    expect(screen.getByText("잠시 후 다시 시도해 주세요.")).not.toBeNull();
    expect(screen.getByText("오류 코드: AUTH-001")).not.toBeNull();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog", { name: "로그아웃 실패" })).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog", { name: "로그아웃 실패" })).toBeNull();
    });
  });
});
