/** @jest-environment node */
import { afterEach, expect, it } from "@jest/globals";
import { analysisReuseKey } from "../../../../../supabase/functions/process-analysis-job/reuseKey";
import type {
  AnalysisJob,
  Target,
} from "../../../../../supabase/functions/process-analysis-job/models/types";

afterEach(() => {
  Reflect.deleteProperty(globalThis, "Deno");
});

it("동일 조건의 재시도만 재사용하며 사용자·문장·오디오·평가·모델 변경을 분리한다", async () => {
  let model = "model-v1";
  Object.defineProperty(globalThis, "Deno", {
    configurable: true,
    value: { env: { get: () => model } },
  });
  const job: AnalysisJob = {
    id: "job1",
    claim_token: "claim",
    user_id: "owner",
    roleplay_session_id: "session",
    memorization_session_id: null,
    evaluation_mode: "exact",
  };
  const target: Target = {
    expectedText: "Hello.",
    recording: {
      roleplay_session_id: "session",
      roleplay_line_id: "line",
      memorization_session_id: null,
      memorization_sentence_id: null,
      bucket_id: "recordings",
      object_path: "owner/audio.webm",
      mime_type: "audio/webm",
    },
  };
  const audio = new Blob(["first"]);
  const key = await analysisReuseKey(job, target, audio);
  expect(await analysisReuseKey({ ...job, id: "retry", claim_token: "new" }, target, audio)).toBe(
    key,
  );
  expect(await analysisReuseKey({ ...job, user_id: "other" }, target, audio)).not.toBe(key);
  expect(await analysisReuseKey({ ...job, evaluation_mode: "context" }, target, audio)).not.toBe(
    key,
  );
  expect(await analysisReuseKey(job, { ...target, expectedText: "Changed." }, audio)).not.toBe(key);
  expect(await analysisReuseKey(job, target, new Blob(["other audio"]))).not.toBe(key);
  model = "model-v2";
  expect(await analysisReuseKey(job, target, audio)).not.toBe(key);
});
