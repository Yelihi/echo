/** @jest-environment node */
import { describe, it, expect } from "@jest/globals";
import { processClaimedJob } from "../../../../../supabase/functions/process-analysis-job/processClaimedJob";
import type {
  AnalysisJob,
  Target,
} from "../../../../../supabase/functions/process-analysis-job/models/types";
import type { AnalysisProcessingDependencies } from "../../../../../supabase/functions/process-analysis-job/models/processing";

const job: AnalysisJob = {
  id: "job",
  claim_token: "claim",
  user_id: "owner",
  roleplay_session_id: "session",
  memorization_session_id: null,
};
const targets: Target[] = ["first", "second"].map((id) => ({
  expectedText: id,
  recording: {
    roleplay_line_id: id,
    memorization_sentence_id: null,
    roleplay_session_id: "session",
    memorization_session_id: null,
    bucket_id: "recordings",
    object_path: id,
    mime_type: "audio/webm",
  },
}));

describe("실제 분석 batch 조율", () => {
  it("첫 타깃이 실패해도 나머지 저장이 끝난 뒤 job을 실패 처리한다", async () => {
    const events: string[] = [];
    let finishSecond!: () => void;
    const dependencies: AnalysisProcessingDependencies = {
      loadTargets: async () => targets,
      filterUnprocessedTargets: async (_, input) => input,
      processTarget: async (_, target) => {
        if (target.expectedText === "first") throw new Error("STT failed");
        await new Promise<void>((resolve) => {
          finishSecond = resolve;
        });
        events.push("second.saved");
      },
      completeJob: async () => {
        events.push("completed");
      },
      requeueJob: async () => {
        events.push("queued");
      },
      failJob: async () => {
        events.push("failed");
      },
    };
    const processing = processClaimedJob(job, dependencies, 3);
    await new Promise((resolve) => setImmediate(resolve));
    expect(events).toEqual([]);
    finishSecond();
    expect((await processing).status).toBe("failed");
    expect(events).toEqual(["second.saved", "failed"]);
  });

  it.each([1, 3])("batch 제한 %i에 따라 재대기 또는 완료한다", async (limit) => {
    const saved: string[] = [];
    const dependencies: AnalysisProcessingDependencies = {
      loadTargets: async () => targets,
      filterUnprocessedTargets: async (_, input) => input,
      processTarget: async (_, target) => {
        saved.push(target.expectedText);
      },
      completeJob: async () => "completed",
      requeueJob: async () => "queued",
      failJob: async () => {
        throw new Error("Unexpected failure");
      },
    };
    const result = await processClaimedJob(job, dependencies, limit);
    expect(result.status).toBe(limit === 1 ? "queued" : "completed");
    expect(saved).toEqual(limit === 1 ? ["first"] : ["first", "second"]);
  });
});
