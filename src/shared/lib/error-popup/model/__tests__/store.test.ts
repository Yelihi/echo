import { afterEach, describe, expect, it } from "@jest/globals";

import { errorPopupManager, useErrorPopupStore } from "../store";

describe("errorPopupManager", () => {
  afterEach(() => {
    errorPopupManager.close();
  });

  it("opens an error popup with a display model", () => {
    errorPopupManager.open({
      title: "로그아웃 실패",
      message: "잠시 후 다시 시도해 주세요.",
      code: "AUTH-001",
    });

    expect(useErrorPopupStore.getState().popup).toEqual({
      title: "로그아웃 실패",
      message: "잠시 후 다시 시도해 주세요.",
      code: "AUTH-001",
    });
  });

  it("replaces the current popup when another popup is opened", () => {
    errorPopupManager.open({
      title: "첫 번째 오류",
      message: "첫 번째 메시지",
      code: "AUTH-001",
    });

    errorPopupManager.open({
      title: "두 번째 오류",
      message: "두 번째 메시지",
      code: "AUTH-002",
    });

    expect(useErrorPopupStore.getState().popup).toEqual({
      title: "두 번째 오류",
      message: "두 번째 메시지",
      code: "AUTH-002",
    });
  });

  it("closes the current popup", () => {
    errorPopupManager.open({
      title: "로그아웃 실패",
      message: "잠시 후 다시 시도해 주세요.",
      code: "AUTH-001",
    });

    errorPopupManager.close();

    expect(useErrorPopupStore.getState().popup).toBeNull();
  });
});
