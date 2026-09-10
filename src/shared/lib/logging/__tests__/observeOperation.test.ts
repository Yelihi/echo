/** @jest-environment node */
import { describe, expect, it } from "@jest/globals";
import { observeOperation } from "../observeOperation";
import { createOperationEventRecorder } from "../testing";

describe("업무 이벤트 기록", () => {
  it("성공 결과를 보존하며 시작과 성공을 같은 실행으로 기록한다", async () => {
    const recorder = createOperationEventRecorder({ print: process.env.TEST_LOGS === "1" });
    const result = await observeOperation({
      operation: "recording.draft.create",
      resourceId: "session-1",
      recordEvent: recorder.recordEvent,
      execute: async () => "recording-1",
    });
    expect(result).toBe("recording-1");
    expect(recorder.events.map((event) => event.phase)).toEqual(["started", "succeeded"]);
    expect(recorder.events[0].operationId).toBe(recorder.events[1].operationId);
  });

  it("업무 실패는 기록하고 원래 오류를 반환한다", async () => {
    const recorder = createOperationEventRecorder({ print: process.env.TEST_LOGS === "1" });
    const failure = new Error("storage unavailable");
    await expect(
      observeOperation({
        operation: "recording.draft.create",
        resourceId: "session-1",
        recordEvent: recorder.recordEvent,
        execute: async () => {
          throw failure;
        },
      }),
    ).rejects.toBe(failure);
    expect(recorder.events.map((event) => event.phase)).toEqual(["started", "failed"]);
  });

  it("로그 출력 실패가 확정된 업무 결과를 바꾸지 않는다", async () => {
    await expect(
      observeOperation({
        operation: "recording.draft.accept",
        resourceId: "recording-1",
        recordEvent: () => {
          throw new Error("logging unavailable");
        },
        execute: async () => "accepted",
      }),
    ).resolves.toBe("accepted");
  });
});
