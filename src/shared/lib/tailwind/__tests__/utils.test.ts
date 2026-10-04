import { cn } from "../utils";

describe("cn radius overrides", () => {
  it.each(["pill", "chip", "control", "panel", "card", "hero"])(
    "lets a caller override the %s radius with an explicit value",
    (radius) => {
      expect(cn(`rounded-${radius}`, "rounded-[7px]")).toBe("rounded-[7px]");
    },
  );

  it("lets a later project token override an explicit radius", () => {
    expect(cn("rounded-[7px]", "rounded-control")).toBe("rounded-control");
  });

  it("preserves radius variants for other states and breakpoints", () => {
    expect(cn("rounded-pill hover:rounded-card md:rounded-panel", "rounded-[7px]")).toBe(
      "hover:rounded-card md:rounded-panel rounded-[7px]",
    );
  });
});
