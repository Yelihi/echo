import { createClient } from "supabase-js";
import type { AudioJob, AudioWorkerRepository } from "./processor.ts";

export function createAudioRepository(): AudioWorkerRepository {
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  return {
    async claim() {
      const { data, error } = await client.rpc("claim_grammar_audio_job").maybeSingle();
      if (error) throw error;
      return data as AudioJob | null;
    },
    async consume(ownerId) {
      const { data, error } = await client.rpc("consume_ai_request", {
        p_operation: "tts",
        p_user_id: ownerId,
      });
      if (error) throw error;
      return data;
    },
    async upload(job, audio) {
      const { data, error } = await client
        .from("grammar_audio_attempts")
        .select("object_path")
        .eq("id", job.claim_token)
        .eq("job_id", job.id)
        .single();
      if (error || !data) throw error ?? new Error("ATTEMPT_NOT_FOUND");
      const result = await client.storage
        .from("grammar-audio")
        .upload(data.object_path, audio, { contentType: "audio/mpeg", upsert: false });
      if (result.error) throw result.error;
    },
    async finish(job, code) {
      const { data, error } = await client.rpc("finish_grammar_audio_job", {
        p_job_id: job.id,
        p_claim_token: job.claim_token,
        p_error_code: code ?? null,
      });
      if (error) throw error;
      return data === true;
    },
  };
}

export async function speak(job: AudioJob): Promise<Uint8Array> {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: job.model,
      input: job.sentence,
      voice: job.voice,
      speed: job.speed,
      response_format: "mp3",
    }),
  });
  if (!response.ok)
    throw Object.assign(new Error("TTS_FAILED"), {
      status: response.status,
      request_id: response.headers.get("x-request-id"),
    });
  return new Uint8Array(await response.arrayBuffer());
}
