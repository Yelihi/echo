import { safeErrorDetails } from "../../../src/shared/lib/logging/safeErrorDetails.ts";
export interface AudioJob {
  id: string;
  owner_id: string;
  sentence: string;
  model: string;
  voice: string;
  speed: number;
  claim_token: string;
}
export interface AudioWorkerRepository {
  claim(): Promise<AudioJob | null>;
  consume(ownerId: string): Promise<string>;
  upload(job: AudioJob, audio: Uint8Array): Promise<void>;
  finish(job: AudioJob, code?: string): Promise<boolean>;
}

export async function processExampleAudioJob(
  job: AudioJob,
  repository: AudioWorkerRepository,
  speak: (job: AudioJob) => Promise<Uint8Array>,
) {
  let stage = "quota.check";
  try {
    const permission = await repository.consume(job.owner_id);
    if (permission !== "allowed") {
      await repository.finish(
        job,
        permission === "not_invited"
          ? "NOT_INVITED"
          : permission === "rate_limited"
            ? "RATE_LIMITED"
            : "GENERATION_FAILED",
      );
      return;
    }
    stage = "tts.generate";
    const audio = await speak(job);
    stage = "storage.upload";
    await repository.upload(job, audio);
    stage = "job.finish";
    await repository.finish(job);
  } catch (error) {
    console.error(
      JSON.stringify({
        operation: "grammar.audio.worker",
        jobId: job.id,
        stage,
        error: safeErrorDetails(error),
      }),
    );
    // A lost acknowledgement may already be ready; the RPC preserves that successful claim.
    await repository.finish(job, "GENERATION_FAILED");
  }
}

export async function processAudioQueue(
  repository: AudioWorkerRepository,
  speak: (job: AudioJob) => Promise<Uint8Array>,
) {
  for (let count = 0; count < 3; count++) {
    const job = await repository.claim();
    if (!job) break;
    await processExampleAudioJob(job, repository, speak);
  }
}
