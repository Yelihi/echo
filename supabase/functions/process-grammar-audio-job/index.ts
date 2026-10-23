// Supabase runtime global, absent from standalone Deno types.
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };
import { authorize } from "./http.ts";
import { processAudioQueue } from "./processor.ts";
import { createAudioRepository, speak } from "./repository.ts";

Deno.serve((request: Request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!authorize(request, Deno.env.get("PROCESS_GRAMMAR_AUDIO_SECRET")))
    return new Response("Unauthorized", { status: 401 });
  EdgeRuntime.waitUntil(
    processAudioQueue(createAudioRepository(), speak).catch(() => {
      console.error("Grammar audio worker failed; pending claims recover through cron");
    }),
  );
  return Response.json({ accepted: true }, { status: 202 });
});
