import { afterEach, describe, expect, it } from "@jest/globals";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorPopupProvider, errorPopupManager } from "@/shared/lib/error-popup";
import { showRecordingError } from "@/views/recording/services/showRecordingError";
import { RecordingRequestError } from "@/features/recording-storage/models/recordingRequestError";

describe("녹음 실패 팝업", () => {
  afterEach(() => errorPopupManager.close());
  it("저장 오류의 원인과 코드를 표시하고 확인 후 닫힌다", async () => {
    render(<ErrorPopupProvider />);
    act(() => showRecordingError(new RecordingRequestError("RECORDING_SERVER_NOT_READY")));
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(screen.getByText(/녹음 저장 서버가 아직 준비되지 않았습니다/)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
