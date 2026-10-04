import { Profiler } from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { RolePlayScriptLine } from "@/views/role-play/ui/editor/RolePlayScriptLine";
import { RolePlayScriptCount } from "@/views/role-play/ui/editor/RolePlayScriptCount";
import { MemorizationParagraphItem } from "@/views/memorization/ui/editor/MemorizationParagraphItem";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

beforeEach(() => {
  useRolePlayEditorStore.getState().hydrate({
    title: "Title",
    situation: "Cafe",
    tags: [],
    lines: [
      { id: "first", speaker: "partner", text: "" },
      { id: "second", speaker: "me", text: "Hello" },
    ],
  });
  useMemorizationEditorStore.getState().hydrate({
    title: "Title",
    tags: [],
    rawText: "One. Two.",
    paragraphs: ["One.", "Two."],
    confirmed: false,
  });
});

describe("editor render boundaries", () => {
  it("updates the edited line and derived count without rendering its neighbour", () => {
    const first = jest.fn(),
      second = jest.fn(),
      count = jest.fn();
    render(
      <>
        <Profiler id="first" onRender={first}>
          <RolePlayScriptLine id="first" index={0} />
        </Profiler>
        <Profiler id="second" onRender={second}>
          <RolePlayScriptLine id="second" index={1} />
        </Profiler>
        <Profiler id="count" onRender={count}>
          <RolePlayScriptCount />
        </Profiler>
      </>,
    );
    first.mockClear();
    second.mockClear();
    count.mockClear();
    fireEvent.change(screen.getByRole("textbox", { name: "1번째 상대방 대사" }), {
      target: { value: "Hi" },
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(count).toHaveBeenCalledTimes(1);
    first.mockClear();
    count.mockClear();
    fireEvent.change(screen.getByRole("textbox", { name: "1번째 상대방 대사" }), {
      target: { value: "Hi there" },
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(count).not.toHaveBeenCalled();
    first.mockClear();
    act(() => useRolePlayEditorStore.getState().setTitle("Changed"));
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
  });
  it("updates only the edited paragraph until confirmation changes every row's presentation", () => {
    const first = jest.fn(),
      second = jest.fn();
    render(
      <>
        <Profiler id="first" onRender={first}>
          <MemorizationParagraphItem index={0} />
        </Profiler>
        <Profiler id="second" onRender={second}>
          <MemorizationParagraphItem index={1} />
        </Profiler>
      </>,
    );
    first.mockClear();
    second.mockClear();
    fireEvent.change(screen.getByRole("textbox", { name: "문단 1" }), {
      target: { value: "New one." },
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    act(() => useMemorizationEditorStore.getState().confirmParagraphs(["New one.", "Two."]));
    expect(second).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("New one.")).toBeInTheDocument();
  });
});
