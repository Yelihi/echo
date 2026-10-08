import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
import { createExampleCandidates } from "@/_tests/features/grammar-example-generation/fixtures";

jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn() }) }));

jest.mock("@/features/grammar-example-generation/services/actions/exampleActions", () => ({
  requestGrammarExamples: jest.fn(async () => ({ ok: true, data: createExampleCandidates() })),
  saveGrammarExamples: jest.fn(),
}));

describe("서버 상세 화면과 클라이언트 예문 편집 연결", () => {
  it("상세 슬롯과 편집을 전환하되 이탈 확인을 취소하면 초안을 유지한다", async () => {
    const { GrammarDetailManager, GrammarManageExamplesButton } =
      await import("@/views/grammar-detail/ui/GrammarDetailManager");

    render(
      <GrammarDetailManager note={createEditorNote()}>
        <h1>서버에서 구성한 상세</h1>
        <GrammarManageExamplesButton />
      </GrammarDetailManager>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "예문 생성·검토" }));
    expect(screen.queryByRole("heading", { name: "서버에서 구성한 상세" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "예문 3개 생성" }));
    fireEvent.change((await screen.findAllByLabelText("영어 예문"))[0], {
      target: { value: "My edited example." },
    });
    await user.click(screen.getByRole("button", { name: "← 노트로 돌아가기" }));
    await user.click(screen.getByRole("button", { name: "계속 검토" }));
    expect(screen.getAllByLabelText("영어 예문")[0]).toHaveValue("My edited example.");
    await user.click(screen.getByRole("button", { name: "← 노트로 돌아가기" }));
    await user.click(screen.getByRole("button", { name: "노트로 돌아가기" }));
    expect(screen.getByRole("heading", { name: "서버에서 구성한 상세" })).toBeVisible();
  });
});
