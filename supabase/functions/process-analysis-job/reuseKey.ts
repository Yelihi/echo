import type {} from "./deno.d.ts";
import type { AnalysisJob, Target } from "./models/types.ts";

// Bump this when evaluation prompts, response schema or diff semantics change.
export const ANALYSIS_REVISION = "2026-10-02-v1";
export function analysisModels() {
  return {
    stt: Deno.env.get("OPENAI_STT_MODEL")?.trim() || "gpt-4o-mini-transcribe",
    evaluation: Deno.env.get("OPENAI_EVALUATION_MODEL")?.trim() || "gpt-5.4-mini",
  };
}

export async function analysisReuseKey(
  job: AnalysisJob,
  target: Target,
  audio: Blob,
): Promise<string> {
  const audioHash = await crypto.subtle.digest("SHA-256", await audio.arrayBuffer());
  const identity = JSON.stringify([
    ANALYSIS_REVISION,
    analysisModels(),
    job.user_id,
    job.roleplay_session_id,
    job.memorization_session_id,
    job.evaluation_mode ?? "exact",
    target.recording,
    target.expectedText,
    Array.from(new Uint8Array(audioHash)),
  ]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
