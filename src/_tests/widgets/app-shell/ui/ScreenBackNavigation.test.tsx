import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import { ScreenBackNavigation } from "@/widgets/app-shell/ui/ScreenBackNavigation";

describe("back navigation", () => {
  it("uses an explicit callback for local or guarded transitions", () => {
    const onBack = jest.fn();
    const { rerender } = render(<BackNavigation href="/home" onBack={onBack} />);
    fireEvent.click(screen.getByRole("button", { name: "뒤로가기" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    rerender(<BackNavigation href="/home" onBack={onBack} disabled />);
    fireEvent.click(screen.getByRole("button", { name: "뒤로가기" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
  it("tracks prop-only transitions and keeps guarded screens in charge of leaving", () => {
    const { rerender } = render(<ScreenBackNavigation pathname="/my-page" />);
    expect(screen.getByRole("link", { name: "뒤로가기" })).toHaveAttribute("href", "/home");
    rerender(<ScreenBackNavigation pathname="/sessions" />);
    expect(screen.getByRole("link", { name: "뒤로가기" })).toHaveAttribute("href", "/my-page");
    rerender(<ScreenBackNavigation pathname="/my-page" />);
    expect(screen.getByRole("link", { name: "뒤로가기" })).toHaveAttribute("href", "/home");
    rerender(<ScreenBackNavigation pathname="/role-playing/new" />);
    expect(screen.queryByRole("link", { name: "뒤로가기" })).not.toBeInTheDocument();
  });
});
