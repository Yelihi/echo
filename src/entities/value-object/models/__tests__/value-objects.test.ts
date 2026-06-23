import { describe, expect, it } from "@jest/globals";

import { createTagValue } from "@/entities/value-object/models/value-objects";

describe("createTagValue", () => {
  it("trims display name and creates a lowercase normalized name", () => {
    const tag = createTagValue("  Travel English  ");

    expect(tag).toEqual({
      displayName: "Travel English",
      normalizedName: "travel english",
    });
  });

  it("collapses repeated whitespace while normalizing tag names", () => {
    const tag = createTagValue("Travel   English");

    expect(tag.normalizedName).toBe("travel english");
  });

  it("rejects an empty tag name after trimming", () => {
    expect(() => createTagValue("   ")).toThrow("Tag name cannot be empty");
  });
});
