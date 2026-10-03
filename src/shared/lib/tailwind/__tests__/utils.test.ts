import { describe, it, expect } from "@jest/globals";
import { cn } from "../utils";

describe("semantic typography classes", () => {
  it("keeps button foreground when the caller overrides its font size", () => {
    expect(cn("text-sm text-on-brand", "text-body-4")).toBe("text-on-brand text-body-4");
  });
  it("replaces custom font size independently from color", () => {
    expect(cn("text-heading-md text-gray-text", "text-display text-black-primary")).toBe(
      "text-display text-black-primary",
    );
  });
});
