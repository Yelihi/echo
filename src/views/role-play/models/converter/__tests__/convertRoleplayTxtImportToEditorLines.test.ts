import { describe, expect, it } from "@jest/globals";

// features
import type { RoleplayTxtImportDraft } from "@/features/roleplay-txt-import/models/schema";

// views
import { convertRoleplayTxtImportToEditorLines } from "@/views/role-play/models/converter/convertRoleplayTxtImportToEditorLines";

describe("convertRoleplayTxtImportToEditorLines", () => {
  it("maps import speaker ids and texts onto editor lines without copying title fields", () => {
    const imported: RoleplayTxtImportDraft = {
      speakers: [
        { id: "partner", displayName: "Clerk" },
        { id: "me", displayName: "Customer" },
      ],
      lines: [
        { speakerId: "partner", text: "Good morning. How can I help you?", translation: null },
        { speakerId: "me", text: "I would like a window seat.", translation: null },
      ],
    };

    const lines = convertRoleplayTxtImportToEditorLines(imported);

    expect(lines).toEqual([
      expect.objectContaining({
        speaker: "partner",
        text: "Good morning. How can I help you?",
      }),
      expect.objectContaining({
        speaker: "me",
        text: "I would like a window seat.",
      }),
    ]);
    expect(lines[0]?.id).toEqual(expect.any(String));
    expect(lines[1]?.id).not.toBe(lines[0]?.id);
  });
});
