import { describe, expect, it } from "@jest/globals";

// entities
import type { UserId } from "@/entities/value-object";

// views
import { roleplayEditorDraftSchema } from "@/views/role-play/config/schema";
import { convertRolePlayEditorDraftToCreateInput } from "@/views/role-play/models/converter/convertRolePlayEditorDraft";

describe("roleplayEditorDraftSchema", () => {
  it("drops empty lines and trims fields before create conversion", () => {
    const parsed = roleplayEditorDraftSchema.parse({
      title: "  Cafe order  ",
      situation: "  Ordering a drink  ",
      tags: ["  Travel  ", "", "Travel"],
      lines: [
        { speaker: "partner", text: "  Hello  " },
        { speaker: "me", text: "   " },
        { speaker: "me", text: "I would like a latte." },
      ],
    });

    expect(parsed).toEqual({
      title: "Cafe order",
      situation: "Ordering a drink",
      tags: ["Travel"],
      lines: [
        { speaker: "partner", text: "Hello" },
        { speaker: "me", text: "I would like a latte." },
      ],
    });

    expect(
      convertRolePlayEditorDraftToCreateInput(
        parsed,
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      ),
    ).toMatchObject({
      title: "Cafe order",
      speakerOneName: "상대방",
      speakerTwoName: "나",
      tags: [{ displayName: "Travel", normalizedName: "travel" }],
      lines: [
        { order: 0, speakerOrder: 1, text: "Hello" },
        { order: 1, speakerOrder: 2, text: "I would like a latte." },
      ],
    });
  });

  it("rejects a draft without a valid line", () => {
    const parsed = roleplayEditorDraftSchema.safeParse({
      title: "Cafe order",
      situation: "Ordering a drink",
      tags: [],
      lines: [{ speaker: "me", text: "   " }],
    });

    expect(parsed.success).toBe(false);
  });
});
