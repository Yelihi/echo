import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest, beforeEach } from "@jest/globals";

let GrammarDifficultySetting: typeof import("@/views/my-page/ui/GrammarDifficultySetting").GrammarDifficultySetting;
let saveGrammarDifficulty: typeof import("@/views/my-page/services/actions/saveGrammarDifficulty").saveGrammarDifficulty;

jest.mock("@/views/my-page/services/actions/saveGrammarDifficulty", () => ({
  saveGrammarDifficulty: jest.fn(),
}));

beforeEach(async () => {
  ({ GrammarDifficultySetting } = await import("@/views/my-page/ui/GrammarDifficultySetting"));
  ({ saveGrammarDifficulty } =
    await import("@/views/my-page/services/actions/saveGrammarDifficulty"));
  jest.clearAllMocks();
});

describe("마이페이지 예문 난이도 설정", () => {
  it("저장된 난이도를 처음부터 선택해 보여준다", () => {
    render(<GrammarDifficultySetting initialDifficulty={3} />);
    expect(screen.getByRole("radio", { name: /3단계/ })).toBeChecked();
  });

  it("기본값 2에서 1~3 중 하나를 저장하고 요청 중에는 다시 변경하거나 저장할 수 없다", async () => {
    let finish!: (result: { ok: true }) => void;
    jest.mocked(saveGrammarDifficulty).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<GrammarDifficultySetting initialDifficulty={2} />);

    expect(screen.getByRole("radio", { name: /2단계/ })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: /3단계/ }));
    fireEvent.click(screen.getByRole("button", { name: /저장/ }));

    expect(saveGrammarDifficulty).toHaveBeenCalledWith(3);
    expect(screen.getByRole("button", { name: /저장/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /1단계/ })).toBeDisabled();
    finish({ ok: true });
    await waitFor(() => expect(screen.getByRole("button", { name: /저장/ })).toBeEnabled());
    expect(screen.getByRole("radio", { name: /3단계/ })).toBeChecked();
  });

  it("저장 실패를 알리고 선택한 난이도를 유지해 재시도할 수 있다", async () => {
    jest.mocked(saveGrammarDifficulty).mockResolvedValue({ ok: false, code: "FAILED" });
    render(<GrammarDifficultySetting initialDifficulty={1} />);

    fireEvent.click(screen.getByRole("radio", { name: /2단계/ }));
    fireEvent.click(screen.getByRole("button", { name: /저장/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/저장/);
    expect(screen.getByRole("radio", { name: /2단계/ })).toBeChecked();
    expect(screen.getByRole("button", { name: /저장/ })).toBeEnabled();
  });
});
