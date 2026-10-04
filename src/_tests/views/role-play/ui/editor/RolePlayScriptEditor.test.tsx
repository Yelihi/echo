import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";

// Count actual row renders while retaining its real hooks and DOM.
jest.mock("@/views/role-play/ui/editor/RolePlayScriptLine", () => {
  const actual = jest.requireActual<
    typeof import("@/views/role-play/ui/editor/RolePlayScriptLine")
  >("@/views/role-play/ui/editor/RolePlayScriptLine");
  return { ...actual, RolePlayScriptLine: jest.fn(actual.RolePlayScriptLine) };
});

const { RolePlayScriptEditor } = jest.requireActual<
  typeof import("@/views/role-play/ui/editor/RolePlayScriptEditor")
>("@/views/role-play/ui/editor/RolePlayScriptEditor");
const { RolePlayScriptLine } = jest.requireMock<
  typeof import("@/views/role-play/ui/editor/RolePlayScriptLine")
>("@/views/role-play/ui/editor/RolePlayScriptLine");

beforeEach(() => {
  useRolePlayEditorStore.getState().hydrate({
    title: "Cafe",
    situation: "Order",
    tags: [],
    lines: [
      { id: "first", speaker: "partner", text: "" },
      { id: "second", speaker: "me", text: "Hello" },
    ],
  });
});

describe("composed script editor", () => {
  it("does not render sibling rows when the edited row changes the header count", () => {
    render(<RolePlayScriptEditor isPending={false} />);
    const rowRenders = jest.mocked(RolePlayScriptLine);
    rowRenders.mockClear();
    fireEvent.change(screen.getByRole("textbox", { name: "1번째 상대방 대사" }), {
      target: { value: "Hi" },
    });
    expect(screen.getByText("2개 대사")).toBeInTheDocument();
    expect(rowRenders.mock.calls.map(([props]) => props.id)).toEqual(["first"]);
    rowRenders.mockClear();
    fireEvent.change(screen.getByRole("textbox", { name: "1번째 상대방 대사" }), {
      target: { value: "Hi again" },
    });
    expect(rowRenders.mock.calls.map(([props]) => props.id)).toEqual(["first"]);
  });
});
