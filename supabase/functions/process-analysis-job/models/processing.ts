import type { AnalysisJob, Target } from "./types.ts";

export interface AnalysisProcessingDependencies {
  loadTargets(job: AnalysisJob): Promise<Target[]>;
  filterUnprocessedTargets(job: AnalysisJob, targets: Target[]): Promise<Target[]>;
  processTarget(job: AnalysisJob, target: Target): Promise<void>;
  completeJob(job: AnalysisJob): Promise<unknown>;
  requeueJob(job: AnalysisJob): Promise<unknown>;
  failJob(job: AnalysisJob, message: string): Promise<unknown>;
}
export type AnalysisProcessingResult =
  | { status: "completed"; job: unknown }
  | { status: "queued"; job: unknown; processed: number; remaining: number }
  | { status: "failed"; job: unknown; error: string };
