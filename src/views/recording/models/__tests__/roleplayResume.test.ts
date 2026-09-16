import { describe, expect, it } from "@jest/globals";
import { getRoleplayResume } from "../roleplayResume";
import { createRolePlayRecordingSessionStore } from "../stores/rolePlayRecordingSessionStore";

const turns = [
  { learnerLineId: "first", partnerLine: "Hello" },
  { learnerLineId: "second", partnerLine: "Next" },
  { learnerLineId: "third", partnerLine: "" },
];

describe("저장 문장 기준 복원", () => {
  it("실제 대상이 아닌 녹음은 제외하고 첫 미저장 문장에서 사용자 입력을 기다린다", () => {
    expect(getRoleplayResume(turns, [null, "unrelated"])).toBeUndefined();
    const resume = getRoleplayResume(turns, ["first", "unrelated"]);
    expect(resume).toEqual({ phase: "ready", step: 2, savedCount: 1, closingPartner: false });
    const store = createRolePlayRecordingSessionStore({
      initialPhase: "ready",
      activeStep: resume!.step,
      totalSteps: 3,
      demoDurationMs: 0,
    });
    store.getState().startTurn(3, "partner-speaking");
    expect(store.getState()).toMatchObject({ currentStep: 2, phase: "partner-speaking" });
  });
  it("전체 녹음이 저장됐으면 재녹음 대신 완료 확인으로 복원한다", () => {
    expect(getRoleplayResume(turns, ["first", "second", "third"])).toMatchObject({
      phase: "completed",
      savedCount: 3,
      step: 3,
    });
  });
  it("마지막 상대방 발화가 남았으면 이어하기 입력 후 재생할 수 있게 한다", () => {
    const resume = getRoleplayResume([{ ...turns[0], closingPartnerLine: "Bye" }], ["first"]);
    expect(resume).toEqual({ phase: "ready", step: 1, savedCount: 1, closingPartner: true });
    const store = createRolePlayRecordingSessionStore(
      { initialPhase: "ready", activeStep: 1, totalSteps: 1, demoDurationMs: 0 },
      true,
    );
    store.getState().startTurn(1, "partner-speaking");
    store.getState().partnerPlaySucceeded();
    expect(store.getState().phase).toBe("completed");
  });
});
