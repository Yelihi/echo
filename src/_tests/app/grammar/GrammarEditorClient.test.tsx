import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import type { useRouter } from "next/navigation";
import type { GrammarNoteEditorProps } from "@/features/grammar-note-editor";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/features/grammar-analysis-edit", () => ({ GrammarAnalysisEditor: () => null }));
jest.mock("@/features/grammar-analysis/services/actions/requestGrammarAnalysis", () => ({
  requestGrammarAnalysis: jest.fn(),
}));
jest.mock("@/features/grammar-note-editor/services/actions/saveGrammarNote", () => ({
  saveGrammarNote: jest.fn(),
}));
jest.mock("@/features/grammar-note-editor", () => ({
  GrammarNoteEditor: ({ onSaved, onExit }: GrammarNoteEditorProps) => (
    <>
      <button onClick={() => onSaved(createEditorNote())}>저장 성공</button>
      <button onClick={onExit}>나가기</button>
    </>
  ),
}));

const push = jest.fn<ReturnType<typeof useRouter>["push"]>();
const refresh = jest.fn<ReturnType<typeof useRouter>["refresh"]>();

beforeEach(async () => {
  const { useRouter } = await import("next/navigation");
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({
    push,
    refresh,
    back: jest.fn(),
    forward: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  });
});

describe("editor route navigation", () => {
  it("opens the saved note with the list context and refreshes server data", async () => {
    const { GrammarEditorClient } =
      await import("@/app/(protected)/grammar/_components/GrammarEditorClient");
    render(<GrammarEditorClient backHref="/grammar?q=contrast&page=2" />);
    fireEvent.click(screen.getByRole("button", { name: "저장 성공" }));
    expect(push).toHaveBeenCalledWith(
      `/grammar/${createEditorNote().id}?returnTo=%2Fgrammar%3Fq%3Dcontrast%26page%3D2`,
    );
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("returns from a new note to the filtered list", async () => {
    const { GrammarEditorClient } =
      await import("@/app/(protected)/grammar/_components/GrammarEditorClient");
    render(<GrammarEditorClient backHref="/grammar?q=contrast&page=2" />);
    fireEvent.click(screen.getByRole("button", { name: "나가기" }));
    expect(push).toHaveBeenCalledWith("/grammar?q=contrast&page=2");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("returns from editing to the note while preserving the list context", async () => {
    const { GrammarEditorClient } =
      await import("@/app/(protected)/grammar/_components/GrammarEditorClient");
    render(
      <GrammarEditorClient
        initialNote={createEditorNote()}
        backHref="/grammar?q=contrast&page=2"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "나가기" }));
    expect(push).toHaveBeenCalledWith(
      `/grammar/${createEditorNote().id}?returnTo=%2Fgrammar%3Fq%3Dcontrast%26page%3D2`,
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it.each([undefined, "https://example.com", "/grammar/other"])(
    "falls back to the list for an absent or invalid return path: %s",
    async (backHref) => {
      const { GrammarEditorClient } =
        await import("@/app/(protected)/grammar/_components/GrammarEditorClient");
      render(<GrammarEditorClient backHref={backHref} />);
      fireEvent.click(screen.getByRole("button", { name: "나가기" }));
      expect(push).toHaveBeenCalledWith("/grammar");
    },
  );
});
