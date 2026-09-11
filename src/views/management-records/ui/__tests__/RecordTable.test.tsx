import "@testing-library/jest-dom/jest-globals";
import { beforeEach, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const refresh = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
jest.mock("../../services/action/deleteManagedRecording", () => ({
  deleteManagedRecording: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it("채택 녹음을 보호하고 확인 후 미채택 녹음을 삭제하며 결과를 갱신한다", async () => {
  const { RecordTable } = await import("../RecordTable");
  const { deleteManagedRecording } = await import("../../services/action/deleteManagedRecording");
  jest.mocked(deleteManagedRecording).mockResolvedValue({ code: "SUCCESS" });
  render(
    <RecordTable
      records={[
        {
          id: "accepted",
          name: "accepted.webm",
          status: "connected",
          fileSize: "1 MB",
          createdAt: "2026.09.11",
        },
        {
          id: "draft",
          name: "draft.webm",
          status: "orphaned",
          fileSize: "1 MB",
          createdAt: "2026.09.11",
        },
      ]}
    />,
  );
  expect(screen.getByRole("button", { name: "accepted.webm 보호됨" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "draft.webm 삭제" }));
  expect(deleteManagedRecording).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "취소" }));
  expect(deleteManagedRecording).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "draft.webm 삭제" }));
  fireEvent.click(screen.getByRole("button", { name: "삭제" }));
  await waitFor(() => expect(deleteManagedRecording).toHaveBeenCalledWith("draft"));
  expect(await screen.findByRole("status")).toHaveTextContent("녹음 파일을 삭제했습니다.");
  expect(refresh).toHaveBeenCalled();
});

it("삭제 실패를 알리고 다시 시도할 수 있게 한다", async () => {
  const { RecordTable } = await import("../RecordTable");
  const { deleteManagedRecording } = await import("../../services/action/deleteManagedRecording");
  jest.mocked(deleteManagedRecording).mockResolvedValue({ code: "DELETE_FAILED" });
  render(
    <RecordTable
      records={[
        {
          id: "failed",
          name: "failed.webm",
          status: "delete-failed",
          fileSize: "1 MB",
          createdAt: "2026.09.11",
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "failed.webm 삭제" }));
  fireEvent.click(screen.getByRole("button", { name: "삭제" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("삭제하지 못했습니다.");
  expect(screen.getByRole("button", { name: "failed.webm 삭제" })).toBeEnabled();
});
