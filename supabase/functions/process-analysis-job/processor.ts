import { authorize, corsHeaders, json } from "./http.ts";
import { evaluate, transcribe } from "./openai.ts";
import {
  claimNextJob,
  completeJob,
  createServiceClient,
  downloadAudio,
  failJob,
  insertResult,
  loadTargets,
  type Supabase,
} from "./repository.ts";
import type { AnalysisJob, PracticeType, Target } from "./types.ts";

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

  return processClaimedJob(supabase, job);
}

async function processClaimedJob(supabase: Supabase, job: AnalysisJob): Promise<Response> {
  try {
    const targets = await loadTargets(supabase, job);

    if (targets.length === 0) {
      throw new Error("No accepted recordings found for analysis job.");
    }

    for (const target of targets) {
      await processTarget(supabase, job, target);
    }

    return json({ status: "completed", job: await completeJob(supabase, job.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis processor failed.";

    return json(
      { status: "failed", job: await failJob(supabase, job.id, message), error: message },
      500,
    );
  }
}

async function processTarget(supabase: Supabase, job: AnalysisJob, target: Target): Promise<void> {
  // Each target is intentionally processed in order. Batch size is one job, so keeping this
  // sequential makes failure handling deterministic and avoids partial parallel writes.
  const audio = await downloadAudio(supabase, target.recording);
  const transcript = await transcribe(audio, target.recording);
  const evaluation = await evaluate({
    expectedText: target.expectedText,
    transcript,
    practiceType: getPracticeType(job),
  });

  await insertResult(supabase, job, target, transcript, evaluation);
}

function getPracticeType(job: {
  roleplay_session_id: string | null;
  memorization_session_id: string | null;
}): PracticeType {
  if (job.roleplay_session_id) {
    return "roleplay";
  }

  if (job.memorization_session_id) {
    return "memorization";
  }

  throw new Error("Analysis job has no session id.");
}
