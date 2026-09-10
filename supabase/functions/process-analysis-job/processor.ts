import type { Supabase } from "./models/repository.ts";
import { processClaimedJob } from "./processClaimedJob.ts";
import { authorize, corsHeaders, json } from "./http.ts";
import { evaluate, transcribe } from "./openai.ts";
import { observeAnalysisOperation } from "./logging.ts";
import {
  claimNextJob,
  completeJob,
  createServiceClient,
  downloadAudio,
  failJob,
  filterUnprocessedTargets,
  insertResult,
  loadTargets,
  requeueJob,
} from "./repository.ts";
import type { AnalysisJob, PracticeType, Target } from "./models/types.ts";

const DEFAULT_TARGET_LIMIT = 3;

export async function handleProcessAnalysisJob(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authError = authorize(request);

  if (authError) {
    return json({ error: authError }, 401);
  }

  const supabase = createServiceClient();
  const job = await claimNextJob(supabase);

  if (!job) {
    return json({ status: "idle" });
  }

  const result = await processClaimedJob(
    job,
    {
      loadTargets: (claimedJob) => loadTargets(supabase, claimedJob),
      filterUnprocessedTargets: (claimedJob, targets) =>
        filterUnprocessedTargets(supabase, claimedJob, targets),
      processTarget: (claimedJob, target) => processTarget(supabase, claimedJob, target),
      completeJob: (claimedJob) => completeJob(supabase, claimedJob),
      requeueJob: (claimedJob) => requeueJob(supabase, claimedJob),
      failJob: (claimedJob, message) => failJob(supabase, claimedJob, message),
    },
    getTargetLimit(),
  );
  return json(result, result.status === "failed" ? 500 : 200);
}

async function processTarget(supabase: Supabase, job: AnalysisJob, target: Target): Promise<void> {
  const context = {
    jobId: job.id,
    targetId:
      target.recording.roleplay_line_id ?? target.recording.memorization_sentence_id ?? "unknown",
  };
  const audio = await observeAnalysisOperation({
    ...context,
    operation: "audio.download",
    execute: () => downloadAudio(supabase, target.recording),
  });
  const transcript = await observeAnalysisOperation({
    ...context,
    operation: "audio.transcribe",
    execute: () => transcribe(audio, target.recording),
  });
  const evaluation = await observeAnalysisOperation({
    ...context,
    operation: "text.evaluate",
    execute: () =>
      evaluate({
        expectedText: target.expectedText,
        transcript,
        practiceType: getPracticeType(job),
        evaluationMode: job.evaluation_mode ?? "exact",
      }),
  });

  await observeAnalysisOperation({
    ...context,
    operation: "result.save",
    execute: () => insertResult(supabase, job, target, transcript, evaluation),
  });
}

function getPracticeType(
  job: Pick<AnalysisJob, "roleplay_session_id" | "memorization_session_id">,
): PracticeType {
  if (job.roleplay_session_id) {
    return "roleplay";
  }

  if (job.memorization_session_id) {
    return "memorization";
  }

  throw new Error("Analysis job has no session id.");
}

function getTargetLimit(): number {
  const configuredLimit = Number(Deno.env.get("ANALYSIS_PROCESSOR_TARGET_LIMIT"));

  if (Number.isInteger(configuredLimit) && configuredLimit > 0) {
    return Math.min(configuredLimit, DEFAULT_TARGET_LIMIT);
  }

  return DEFAULT_TARGET_LIMIT;
}
