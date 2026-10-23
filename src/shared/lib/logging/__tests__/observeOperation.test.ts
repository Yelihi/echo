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

it("실패 로그에는 원인 코드만 남기고 비밀 값과 원문은 남기지 않는다", async () => {
  const recorder = createOperationEventRecorder();
  const error = Object.assign(new Error("private sentence and secret"), {
    code: "PGRST202",
    details: "secret",
    hint: "private",
  });
  await expect(
    observeOperation({
      operation: "grammar.audio.status",
      resourceId: "grammar-audio",
      recordEvent: recorder.recordEvent,
      execute: async () => {
        throw error;
      },
    }),
  ).rejects.toBe(error);
  expect(recorder.events[1]).toEqual(
    expect.objectContaining({ error: expect.objectContaining({ code: "PGRST202" }) }),
  );
  expect(JSON.stringify(recorder.events)).not.toMatch(/private|secret/);
});

it("Supabase 함수 HTTP 오류의 status만 기록하며 응답 본문을 노출하지 않는다", async () => {
  const { FunctionsHttpError } = await import("@supabase/supabase-js");
  const recorder = createOperationEventRecorder();
  await expect(
    observeOperation({
      operation: "grammar.audio.prepare",
      resourceId: "note",
      getStage: () => "worker.invoke",
      recordEvent: recorder.recordEvent,
      execute: async () => {
        throw new FunctionsHttpError(new Response("private token", { status: 401 }));
      },
    }),
  ).rejects.toThrow();
  expect(recorder.events[1]).toEqual(
    expect.objectContaining({
      stage: "worker.invoke",
      error: { code: "FUNCTION_HTTP_ERROR", status: 401 },
    }),
  );
  expect(JSON.stringify(recorder.events)).not.toContain("private token");
});
