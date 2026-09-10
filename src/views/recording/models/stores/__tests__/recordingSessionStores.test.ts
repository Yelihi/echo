import { describe, expect, it } from "@jest/globals";

import { createMemorizationRecordingSessionStore } from "@/views/recording/models/stores/memorizationRecordingSessionStore";
import { createRolePlayRecordingSessionStore } from "@/views/recording/models/stores/rolePlayRecordingSessionStore";

const initial = {
  initialPhase: "ready" as const,
  activeStep: 0,
  totalSteps: 4,
  demoDurationMs: 12000,
};

describe("recording session stores", () => {
  it("마지막 학습자 저장 뒤에는 새 녹음 단계 대신 완료 상태가 된다", () => {
    const store = createRolePlayRecordingSessionStore({
      ...initial,
      initialPhase: "recorded",
      activeStep: 4,
    });
    store.getState().saveSucceeded(4, "completed");
    expect(store.getState()).toMatchObject({ phase: "completed", currentStep: 4, saving: false });
  });

  it("상대방의 마무리 발화가 있으면 재생이 끝난 뒤 완료된다", () => {
    const store = createRolePlayRecordingSessionStore({
      ...initial,
      initialPhase: "recorded",
      activeStep: 4,
    });
    store.getState().saveSucceeded(4, "partner-speaking");
    expect(store.getState()).toMatchObject({
      phase: "partner-speaking",
      closingPartner: true,
      canReplayPartner: false,
    });
    store.getState().partnerPlaySucceeded();
    expect(store.getState().phase).toBe("completed");
  });
  it("keeps state isolated between recording sessions", () => {
    const first = createMemorizationRecordingSessionStore(initial);
    const second = createMemorizationRecordingSessionStore(initial);

    first.getState().startTurn(4, "user-ready");

    expect(first.getState().phase).toBe("user-ready");
    expect(second.getState().phase).toBe("ready");
  });

  it("clamps the first step when role-play starts from ready", () => {
    const store = createRolePlayRecordingSessionStore(initial);

    store.getState().startTurn(4, "partner-speaking");

    expect(store.getState()).toMatchObject({
      currentStep: 1,
      phase: "partner-speaking",
    });
  });

  it("moves role-play to partner speaking after save", () => {
    const store = createRolePlayRecordingSessionStore({
      initialPhase: "recorded",
      activeStep: 1,
      totalSteps: 4,
      demoDurationMs: 12000,
    });

    store.getState().saveSucceeded(4, "partner-speaking");

    expect(store.getState()).toMatchObject({
      currentStep: 2,
      phase: "partner-speaking",
    });
  });

  it("moves memorization to user ready after save", () => {
    const store = createMemorizationRecordingSessionStore({
      initialPhase: "recorded",
      activeStep: 1,
      totalSteps: 4,
      demoDurationMs: 12000,
    });

    store.getState().saveSucceeded(4, "user-ready");

    expect(store.getState()).toMatchObject({
      currentStep: 2,
      phase: "user-ready",
    });
  });

  it("keeps the recorded phase visible when save fails", () => {
    const store = createMemorizationRecordingSessionStore({
      initialPhase: "recorded",
      activeStep: 1,
      totalSteps: 4,
      demoDurationMs: 12000,
    });
    store.getState().saveStarted();

    store.getState().saveFailure();

    expect(store.getState()).toMatchObject({
      phase: "recorded",
      saveFailed: true,
      saving: false,
    });
  });
});
