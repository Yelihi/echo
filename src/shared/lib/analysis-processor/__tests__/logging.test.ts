/** @jest-environment node */
import type { AnalysisEvent } from "../../../../../supabase/functions/process-analysis-job/models/logging";
import { describe, expect, it } from "@jest/globals";
import { observeAnalysisOperation } from "../../../../../supabase/functions/process-analysis-job/logging";

describe("분석 단계 로그", () => {
  it("병렬 타깃의 완료 순서가 달라도 각 실행의 시작과 종료를 연결한다", async () => {
    const events: AnalysisEvent[] = [];
    const recordEvent = (event: AnalysisEvent) => {
      events.push(event);
      if (process.env.TEST_LOGS === "1") console.info(JSON.stringify(event));
    };
    let finishFirst!: (value: string) => void;
    const first = observeAnalysisOperation({
      operation: "audio.transcribe",
      jobId: "job-1",
      targetId: "target-1",
      recordEvent,
      execute: () =>
        new Promise<string>((resolve) => {
          finishFirst = resolve;
        }),
    });
    const second = await observeAnalysisOperation({
      operation: "audio.transcribe",
      jobId: "job-1",
      targetId: "target-2",
      recordEvent,
      execute: async () => "second transcript",
    });
    finishFirst("first transcript");
    expect(await first).toBe("first transcript");
    expect(second).toBe("second transcript");
    for (const targetId of ["target-1", "target-2"]) {
      const targetEvents = events.filter((event) => event.targetId === targetId);
      expect(targetEvents.map((event) => event.phase)).toEqual(["started", "succeeded"]);
      expect(targetEvents[0].operationId).toBe(targetEvents[1].operationId);
    }
    expect(JSON.stringify(events)).not.toContain("transcript");
  });

  it("원본 오류를 유지하되 오류 전문은 로그에 포함하지 않는다", async () => {
    const events: AnalysisEvent[] = [];
    const error = new Error("sensitive provider response");
    await expect(
      observeAnalysisOperation({
        operation: "text.evaluate",
        jobId: "job-1",
        targetId: "target-1",
        recordEvent: (event) => {
          events.push(event);
        },
        execute: async () => {
          throw error;
        },
      }),
    ).rejects.toBe(error);
    expect(events.map((event) => event.phase)).toEqual(["started", "failed"]);
    expect(JSON.stringify(events)).not.toContain(error.message);
  });
});
