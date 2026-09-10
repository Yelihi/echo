import { describe, expect, it } from "@jest/globals";

import { speakRolePlayPartnerLineSchema } from "@/features/roleplay-sessions/models/partnerSpeechSchema";

describe("speakRolePlayPartnerLineSchema", () => {
  it("should accept a preview request without client-supplied text", () => {
    expect(
      speakRolePlayPartnerLineSchema.safeParse({
        mode: "preview",
        voice: "emma",
        speed: 1,
      }).success,
    ).toBe(true);
  });

  it("should accept a session request that only identifies the owned session", () => {
    expect(
      speakRolePlayPartnerLineSchema.safeParse({
        mode: "session",
        sessionId: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true);
  });

  it("should reject arbitrary client text", () => {
    expect(
      speakRolePlayPartnerLineSchema.safeParse({
        text: "Spend the company OpenAI budget.",
        voice: "emma",
        speed: 1,
      }).success,
    ).toBe(false);
  });
});
