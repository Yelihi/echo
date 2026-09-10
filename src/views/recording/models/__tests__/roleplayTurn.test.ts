import { describe, expect, it } from "@jest/globals";
import { resolveRoleplayTurn } from "../roleplayTurn";

describe("롤플레잉 턴 선택", () => {
  const partner = {
    autoAdvance: true,
    turns: [
      { learnerLineId: "one", partnerLine: "First prompt." },
      { learnerLineId: "two", partnerLine: "Second prompt.", closingPartnerLine: "Goodbye." },
    ],
  };
  it("저장 후 다음 단계에서는 다음 문장과 TTS 타깃을 함께 선택한다", () => {
    const first = resolveRoleplayTurn(partner, 1, 2, false);
    const second = resolveRoleplayTurn(partner, 2, 2, false);
    expect(first.phaseAfterSave).toBe("partner-speaking");
    expect(second.partnerLine).toBe("Second prompt.");
    expect(second.activeTurn?.learnerLineId).toBe("two");
    expect(second.phaseAfterSave).toBe("partner-speaking");
    expect(resolveRoleplayTurn(partner, 2, 2, true).partnerLine).toBe("Goodbye.");
  });
  it("학습자 선발화와 학습자 마지막 발화를 처리한다", () => {
    const turn = resolveRoleplayTurn(
      { autoAdvance: true, turns: [{ learnerLineId: "one", partnerLine: "" }] },
      1,
      1,
      false,
    );
    expect(turn.phaseOnStart).toBe("user-ready");
    expect(turn.phaseAfterSave).toBe("completed");
  });
});
