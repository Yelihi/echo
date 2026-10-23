import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render as renderUI, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
import { createExampleCandidates } from "@/_tests/features/grammar-example-generation/fixtures";
import type { GrammarAudioButtonProps } from "@/features/grammar-audio";
import { GrammarExamplesSection } from "@/views/grammar-detail/ui/GrammarExamplesSection";

jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn() }) }));

jest.mock("@/features/grammar-example-generation/services/actions/exampleActions", () => ({
  requestGrammarExamples: jest.fn(async () => ({ ok: true, data: createExampleCandidates() })),
  saveGrammarExamples: jest.fn(),
}));

describe("서버 상세 화면과 클라이언트 예문 편집 연결", () => {
  it("저장된 예문의 자연 번역과 영한 직독직해 블록을 전환한다", async () => {
    const sentence = "He is not a driver but a teacher.";
    const example = {
      ...createExampleCandidates()[0],
      sentence,
      directReading: [
        { start: 0, end: 6, korean: "그는" },
        { start: 6, end: sentence.length, korean: "운전사가 아니라 교사입니다" },
      ],
    };
    const note = { ...createEditorNote(), examples: [example] };
    render(
      <GrammarExamplesSection
        note={note}
        manageButton={null}
        generateAudio={jest.fn<GrammarAudioButtonProps["generate"]>()}
      />,
    );
    const user = userEvent.setup();

    expect(screen.getByText(example.translation)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "직독직해" }));
    expect(screen.getByText("He is")).toBeVisible();
    expect(screen.getByText("그는")).toBeVisible();
    expect(screen.getByText("not a driver but a teacher.")).toBeVisible();
    expect(screen.getByText("운전사가 아니라 교사입니다")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "자연스러운 해석" }));
    expect(screen.getByText(example.translation)).toBeVisible();
  });
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
    await user.click(screen.getAllByRole("button", { name: "이 예문 수정" })[0]);
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

function QueryWrapper({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
const render = (ui: ReactNode) => renderUI(ui, { wrapper: QueryWrapper });
