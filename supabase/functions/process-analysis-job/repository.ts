import type {} from "./deno.d.ts";
// @ts-expect-error Deno import map resolves this in Supabase Edge Functions.
import { createClient } from "supabase-js";

import type { AcceptedRecording, AnalysisJob, Evaluation, Target } from "./types.ts";

export type Supabase = ReturnType<typeof createClient>;

type SnapshotText = {
  id: string;
  text_snapshot: string;
};

export function createServiceClient(): Supabase {
  const url = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function claimNextJob(supabase: Supabase): Promise<AnalysisJob | null> {
  const { data, error } = await supabase
    .rpc("claim_next_analysis_job", { p_provider: "openai" })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AnalysisJob | null;
}

export async function loadTargets(supabase: Supabase, job: AnalysisJob): Promise<Target[]> {
  if (job.roleplay_session_id) {
    return loadRoleplayTargets(supabase, job.user_id, job.roleplay_session_id);
  }

  if (job.memorization_session_id) {
    return loadMemorizationTargets(supabase, job.user_id, job.memorization_session_id);
  }

  throw new Error("Analysis job has no session id.");
}

export async function downloadAudio(
  supabase: Supabase,
  recording: AcceptedRecording,
): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(recording.bucket_id)
    .download(recording.object_path);

  if (error) {
    throw error;
  }

  return new Blob([await data.arrayBuffer()], { type: recording.mime_type });
}

export async function insertResult(
  supabase: Supabase,
  job: AnalysisJob,
  target: Target,
  transcript: string,
  evaluation: Evaluation,
): Promise<void> {
  const { error } = await supabase.from("practice_target_analysis_results").insert({
    user_id: job.user_id,
    analysis_job_id: job.id,
    roleplay_session_id: target.recording.roleplay_session_id,
    roleplay_line_id: target.recording.roleplay_line_id,
    memorization_session_id: target.recording.memorization_session_id,
    memorization_sentence_id: target.recording.memorization_sentence_id,
    transcript,
    feedback: {
      schema_version: "v1",
      diff: evaluation.diff,
      feedback: evaluation.feedback,
    },
    score: evaluation.score,
  });

  if (error) {
    throw error;
  }
}

export function completeJob(supabase: Supabase, jobId: string): Promise<AnalysisJob> {
  return rpcOne<AnalysisJob>(supabase, "complete_analysis_job", { p_job_id: jobId });
}

export function failJob(supabase: Supabase, jobId: string, message: string): Promise<AnalysisJob> {
  return rpcOne<AnalysisJob>(supabase, "fail_analysis_job", {
    p_job_id: jobId,
    p_error_code: "ANALYSIS_PROCESSOR_FAILED",
    p_error_message: message,
    p_error_log_ref: null,
  });
}

async function loadRoleplayTargets(
  supabase: Supabase,
  userId: string,
  sessionId: string,
): Promise<Target[]> {
  const recordings = await selectRows<AcceptedRecording>(
    supabase
      .from("accepted_recordings")
      .select("*")
      .eq("user_id", userId)
      .eq("roleplay_session_id", sessionId)
      .order("created_at", { ascending: true }),
  );
  const lines = await selectRows<SnapshotText>(
    supabase
      .from("roleplay_session_lines")
      .select("id,text_snapshot")
      .eq("user_id", userId)
      .eq("session_id", sessionId),
  );

  return mapRecordingsToTargets(recordings, lines, (recording) => recording.roleplay_line_id);
}

async function loadMemorizationTargets(
  supabase: Supabase,
  userId: string,
  sessionId: string,
): Promise<Target[]> {
  const recordings = await selectRows<AcceptedRecording>(
    supabase
      .from("accepted_recordings")
      .select("*")
      .eq("user_id", userId)
      .eq("memorization_session_id", sessionId)
      .order("created_at", { ascending: true }),
  );
  const sentences = await selectRows<SnapshotText>(
    supabase
      .from("memorization_session_sentences")
      .select("id,text_snapshot")
      .eq("user_id", userId)
      .eq("session_id", sessionId),
  );

  return mapRecordingsToTargets(
    recordings,
    sentences,
    (recording) => recording.memorization_sentence_id,
  );
}

function mapRecordingsToTargets(
  recordings: AcceptedRecording[],
  snapshots: SnapshotText[],
  getSnapshotId: (recording: AcceptedRecording) => string | null,
): Target[] {
  const snapshotTextById = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot.text_snapshot]),
  );

  return recordings.map((recording) => {
    const snapshotId = getSnapshotId(recording);
    const expectedText = snapshotId ? snapshotTextById.get(snapshotId) : undefined;

    if (!expectedText) {
      throw new Error(`Missing expected text snapshot for ${recording.object_path}.`);
    }

    return { recording, expectedText };
  });
}

async function rpcOne<T>(
  supabase: Supabase,
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.rpc(name, args).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`${name} returned no row.`);
  }

  return data as T;
}

async function selectRows<T>(
  query: PromiseLike<{ data: unknown[] | null; error: unknown }>,
): Promise<T[]> {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as T[];
}
