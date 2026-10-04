import { useState } from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "@/shared/components/atomics/input/Input";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { TagInputField } from "@/shared/components/ui/TagInputField";

function Tags() {
  const [tags, setTags] = useState(["일상"]);
  return (
    <TagInputField tags={tags} onChange={setTags} getDuplicateKey={(tag) => tag.toLowerCase()} />
  );
}

describe("shared practice inputs", () => {
  it("preserves controlled text changes and error/disabled semantics", () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <Input aria-label="제목" value="" onChange={onChange} state="error" />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Cafe" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    rerender(<Input aria-label="제목" disabled value="" onChange={onChange} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
  it("preserves multiline editing and its error state", () => {
    const onChange = jest.fn();
    render(
      <Textarea
        aria-label="본문"
        rows={3}
        state="error"
        defaultValue="first"
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "first\nsecond" } });
    expect(screen.getByRole("textbox")).toHaveValue("first\nsecond");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it("keeps composition, duplicate prevention, removal and empty backspace intact", () => {
    render(<Tags />);
    const input = screen.getByRole("textbox", { name: "태그 입력" });
    fireEvent.change(input, { target: { value: "Cafe" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(screen.queryByRole("button", { name: "Cafe 태그 삭제" })).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("button", { name: "Cafe 태그 삭제" })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "cafe" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.queryByRole("button", { name: "cafe 태그 삭제" })).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(screen.queryByRole("button", { name: "Cafe 태그 삭제" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "일상 태그 삭제" }));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
