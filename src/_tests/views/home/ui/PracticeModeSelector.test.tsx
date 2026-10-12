import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { practiceModes } from "@/views/home/config/const";
import { PracticeModeSelector } from "@/views/home/ui/PracticeModeSelector";

describe("practice mode selection", () => {
  it("shows a distinct, available image with a relevant description for each mode", () => {
    render(<PracticeModeSelector />);

    const visibleImages = practiceModes.map((mode) => {
      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", mode.imageAlt);
      expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(mode.image);
      expect(existsSync(join(process.cwd(), "public", mode.image))).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "다음 연습 모드" }));
      return image.getAttribute("src");
    });

    expect(new Set(visibleImages).size).toBe(practiceModes.length);
    expect(practiceModes.find((mode) => mode.id === "grammar")?.imageAlt).toMatch(/어법|문법/);
  });

  it("keeps the title, counter, active navigation and destination synchronized", () => {
    render(<PracticeModeSelector />);
    fireEvent.click(screen.getByRole("button", { name: "다음 연습 모드" }));
    expect(screen.getByRole("heading", { name: "문단 암기", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "문단 암기 시작하기" })).toHaveAttribute(
      "href",
      "/sentence-memorization",
    );
    expect(screen.getByRole("button", { name: "02 문단 암기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "다음 연습 모드" }));
    expect(screen.getByRole("heading", { name: "어법 연습", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "어법 연습 시작하기" })).toHaveAttribute(
      "href",
      "/grammar",
    );
    fireEvent.click(screen.getByRole("button", { name: "다음 연습 모드" }));
    expect(screen.getByRole("heading", { name: "롤플레잉", level: 2 })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: "이전 연습 모드" }), { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { name: "어법 연습", level: 2 })).toBeInTheDocument();
  });

  it("ignores short and cancelled touches, but advances after a deliberate swipe", () => {
    render(<PracticeModeSelector />);
    const photo = screen.getByRole("img").parentElement!;

    fireEvent.touchStart(photo, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(photo, { changedTouches: [{ clientX: 170 }] });
    expect(screen.getByRole("heading", { name: "롤플레잉", level: 2 })).toBeInTheDocument();
    fireEvent.touchStart(photo, { touches: [{ clientX: 200 }] });
    fireEvent.touchCancel(photo);
    fireEvent.touchEnd(photo, { changedTouches: [{ clientX: 50 }] });
    expect(screen.getByRole("heading", { name: "롤플레잉", level: 2 })).toBeInTheDocument();
    fireEvent.touchStart(photo, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(photo, { changedTouches: [{ clientX: 50 }] });
    expect(screen.getByRole("heading", { name: "문단 암기", level: 2 })).toBeInTheDocument();
  });
});
