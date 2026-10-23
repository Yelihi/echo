/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";
import {
  processExampleAudioJob,
  type AudioJob,
  type AudioWorkerRepository,
} from "../../../../supabase/functions/process-grammar-audio-job/processor";

const job: AudioJob = {
  id: "job",
  owner_id: "owner",
  sentence: "Saved sentence",
  model: "tts-1",
  voice: "alloy",
  speed: 1,
  claim_token: "claim",
};
function setup() {
  const events: string[] = [];
  const repository: AudioWorkerRepository = {
    claim: jest.fn(async () => job),
    consume: jest.fn(async () => {
      events.push("quota");
      return "allowed";
    }),
    upload: jest.fn(async () => {
      events.push("upload");
    }),
    finish: jest.fn(async () => {
      events.push("finish");
      return true;
    }),
  };
  const speak = jest.fn(async () => {
    events.push("tts");
    return new Uint8Array([1, 2]);
  });
  return { repository, speak, events };
}
describe("durable audio worker", () => {
  it("a1: claim → quota → TTS → immutable upload → fenced completion", async () => {
    const d = setup();
    await processExampleAudioJob(job, d.repository, d.speak);
    expect(d.events).toEqual(["quota", "tts", "upload", "finish"]);
    expect(d.repository.consume).toHaveBeenCalledWith("owner");
    expect(d.repository.upload).toHaveBeenCalledWith(job, new Uint8Array([1, 2]));
  });
  it("a1-partial: quota rejection and TTS timeout finish retryable without paid retry", async () => {
    const d = setup();
    jest.mocked(d.repository.consume).mockResolvedValueOnce("rate_limited");
    await processExampleAudioJob(job, d.repository, d.speak);
    expect(d.speak).not.toHaveBeenCalled();
    expect(d.repository.finish).toHaveBeenCalledWith(job, "RATE_LIMITED");
    d.speak.mockRejectedValueOnce(new Error("timeout"));
    await processExampleAudioJob(job, d.repository, d.speak);
    expect(d.speak).toHaveBeenCalledTimes(1);
    expect(d.repository.upload).not.toHaveBeenCalled();
    expect(d.repository.finish).toHaveBeenLastCalledWith(job, "GENERATION_FAILED");
  });
  it("a1-stale-attempt: rejected attachment never retries TTS or overwrites another asset", async () => {
    const d = setup();
    jest.mocked(d.repository.finish).mockResolvedValue(false);
    await processExampleAudioJob(job, d.repository, d.speak);
    expect(d.speak).toHaveBeenCalledTimes(1);
    expect(d.repository.upload).toHaveBeenCalledTimes(1);
    expect(d.repository.finish).toHaveBeenCalledTimes(1);
  });
  it("uncertain completion is fenced again without another provider request", async () => {
    const d = setup();
    jest.mocked(d.repository.finish).mockRejectedValueOnce(new Error("network"));
    await processExampleAudioJob(job, d.repository, d.speak);
    expect(d.speak).toHaveBeenCalledTimes(1);
    expect(d.repository.finish).toHaveBeenLastCalledWith(job, "GENERATION_FAILED");
  });
});
