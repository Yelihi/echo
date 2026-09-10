import type { AnalysisJob } from "./models/types.ts";
import type {
  AnalysisProcessingDependencies,
  AnalysisProcessingResult,
} from "./models/processing.ts";

export async function processClaimedJob(
  job: AnalysisJob,
  dependencies: AnalysisProcessingDependencies,
  targetLimit: number,
): Promise<AnalysisProcessingResult> {
  try {
    const targets = await dependencies.loadTargets(job);
    if (targets.length === 0) throw new Error("No accepted recordings found for analysis job.");
    const pendingTargets = await dependencies.filterUnprocessedTargets(job, targets);
    const batch = pendingTargets.slice(0, targetLimit);
    // 일부 실패해도 다른 타깃의 저장이 끝난 후 job을 종료해야 늦은 쓰기를 막을 수 있다.
    const outcomes = await Promise.allSettled(
      batch.map((target) => dependencies.processTarget(job, target)),
    );
    const failure = outcomes.find((outcome) => outcome.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
    if (pendingTargets.length > batch.length) {
      return {
        status: "queued",
        processed: batch.length,
        remaining: pendingTargets.length - batch.length,
        job: await dependencies.requeueJob(job),
      };
    }
    return { status: "completed", job: await dependencies.completeJob(job) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis processor failed.";
    return { status: "failed", job: await dependencies.failJob(job, message), error: message };
  }
}
