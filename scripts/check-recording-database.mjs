import { URL } from "node:url";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import console from "node:console";
import { Buffer } from "node:buffer";
import { createClient } from "@supabase/supabase-js";

// 로컬 CLI가 반환한 주소만 사용한다. 앱의 운영 환경 변수는 읽지 않는다.
let config;
try {
  config = JSON.parse(
    execFileSync("node_modules/.bin/supabase", ["status", "-o", "json"], {
      encoding: "utf8",
      timeout: 15000,
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
} catch {
  throw new Error(
    "Local Supabase is unavailable. Start Docker and run npm run supabase:start. Remote fallback is disabled.",
  );
}
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(config.API_URL).hostname),
  "Only local Supabase is allowed",
);
const admin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const anonymous = createClient(config.API_URL, config.ANON_KEY, {
  auth: { persistSession: false },
});
const userIds = [];
const uploadedPaths = [];
const sessionId = randomUUID();
function accepted(result) {
  assert.equal(result.error, null, result.error?.message);
  return result.data;
}
const credentialsByUser = new Map();
async function createUser() {
  const email = `recording-${randomUUID()}@example.test`;
  const password = randomUUID();
  const { user } = accepted(
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    }),
  );
  userIds.push(user.id);
  credentialsByUser.set(user.id, { email, password });
  return user.id;
}
try {
  const ownerId = await createUser();
  const otherUserId = await createUser();
  const owner = createClient(config.API_URL, config.ANON_KEY, { auth: { persistSession: false } });
  accepted(await owner.auth.signInWithPassword(credentialsByUser.get(ownerId)));
  const snapshotInput = {
    p_material_id: null,
    p_material_title: "Review regression",
    p_situation: "Test",
    p_speaker_one_name: "Partner",
    p_speaker_two_name: "Learner",
    p_selected_learner_speaker_order: 2,
    p_partner_voice: "emma",
    p_speech_speed: 1,
    p_evaluation_mode: "context",
    p_tags: [],
    p_lines: [
      { line_order: 0, speaker_order: 1, text_snapshot: "Hello", translation_snapshot: null },
    ],
  };
  assert(
    (await owner.rpc("create_roleplay_session_snapshot", snapshotInput)).error,
    "A session with no learner lines must be rejected",
  );
  const modeSessionId = accepted(
    await owner.rpc("create_roleplay_session_snapshot", {
      ...snapshotInput,
      p_lines: [{ ...snapshotInput.p_lines[0], speaker_order: 2 }],
    }),
  );
  assert.equal(
    accepted(
      await owner
        .from("roleplay_sessions")
        .select("evaluation_mode")
        .eq("id", modeSessionId)
        .single(),
    ).evaluation_mode,
    "context",
  );
  assert(
    (
      await owner
        .from("roleplay_sessions")
        .update({ evaluation_mode: "exact" })
        .eq("id", modeSessionId)
    ).error,
    "Persisted evaluation mode is immutable",
  );

  const lines = [randomUUID(), randomUUID()];
  accepted(
    await admin.from("roleplay_sessions").insert({
      id: sessionId,
      user_id: ownerId,
      material_title_snapshot: "Recording regression",
      situation_snapshot: "Local test only",
      speaker_one_name_snapshot: "Partner",
      speaker_two_name_snapshot: "Learner",
      selected_learner_speaker_order: 2,
      status: "ready",
      evaluation_mode: "context",
    }),
  );
  accepted(
    await admin.from("roleplay_session_lines").insert(
      lines.map((id, index) => ({
        id,
        user_id: ownerId,
        session_id: sessionId,
        line_order: index,
        speaker_order: 2,
        text_snapshot: `Line ${index}`,
      })),
    ),
  );
  const recordings = [];
  for (const lineId of lines) {
    const recordingId = randomUUID();
    const objectPath = `${ownerId}/${sessionId}/${recordingId}.wav`;
    accepted(
      await admin.storage
        .from("recordings")
        .upload(objectPath, Buffer.alloc(16044), { contentType: "audio/wav", upsert: false }),
    );
    uploadedPaths.push(objectPath);
    recordings.push({
      p_user_id: ownerId,
      p_session_id: sessionId,
      p_line_id: lineId,
      p_recording_id: recordingId,
      p_object_path: objectPath,
      p_mime_type: "audio/wav",
      p_size_bytes: 16044,
      p_duration_ms: 1000,
    });
  }
  assert(
    (await anonymous.rpc("commit_roleplay_recording", recordings[0])).error,
    "Anonymous RPC must be rejected",
  );
  assert(
    (await admin.rpc("commit_roleplay_recording", { ...recordings[0], p_user_id: otherUserId }))
      .error,
    "Wrong owner must be rejected",
  );
  assert(
    (await admin.rpc("commit_roleplay_recording", recordings[1])).error,
    "Out-of-order target must be rejected",
  );
  const directRecording = {
    id: randomUUID(),
    user_id: ownerId,
    roleplay_session_id: sessionId,
    roleplay_line_id: lines[1],
    bucket_id: "recordings",
    object_path: recordings[1].p_object_path,
    mime_type: "audio/wav",
    size_bytes: 16044,
    duration_ms: 1000,
  };
  assert(
    (await owner.from("accepted_recordings").insert(directRecording)).error,
    "Authenticated direct roleplay writes must be rejected",
  );
  assert(
    (await admin.from("accepted_recordings").insert(directRecording)).error,
    "Legacy service writes must also respect target order",
  );
  assert(
    (
      await admin.from("accepted_recordings").insert({
        ...directRecording,
        roleplay_line_id: lines[0],
        object_path: "missing.wav",
      })
    ).error,
    "Direct writes cannot reference missing storage objects",
  );
  const finish = { p_user_id: ownerId, p_session_id: sessionId };
  assert(
    (await admin.rpc("finish_roleplay_recording", finish)).error,
    "Incomplete session must not finish",
  );
  assert.equal(
    accepted(await admin.from("roleplay_sessions").select("status").eq("id", sessionId).single())
      .status,
    "ready",
  );
  assert.equal(
    accepted(await admin.from("analysis_jobs").select("id").eq("roleplay_session_id", sessionId))
      .length,
    0,
  );

  (
    await Promise.all([
      admin.rpc("commit_roleplay_recording", recordings[0]),
      admin.rpc("commit_roleplay_recording", recordings[0]),
    ])
  ).forEach(accepted);
  assert.equal(
    accepted(
      await admin.from("accepted_recordings").select("id").eq("roleplay_session_id", sessionId),
    ).length,
    1,
  );
  assert(
    (
      await admin.rpc("commit_roleplay_recording", {
        ...recordings[0],
        p_recording_id: randomUUID(),
      })
    ).error,
    "A second recording for the accepted target must fail",
  );
  accepted(await admin.rpc("commit_roleplay_recording", recordings[1]));
  (
    await Promise.all([
      admin.rpc("finish_roleplay_recording", finish),
      admin.rpc("finish_roleplay_recording", finish),
    ])
  ).forEach(accepted);
  const jobs = accepted(
    await admin
      .from("analysis_jobs")
      .select("id,evaluation_mode")
      .eq("roleplay_session_id", sessionId),
  );
  assert.equal(jobs[0].evaluation_mode, "context");
  assert.equal(jobs.length, 1, "Concurrent completion must enqueue exactly one job");
  assert.equal(
    accepted(await admin.from("roleplay_sessions").select("status").eq("id", sessionId).single())
      .status,
    "completed",
  );
  accepted(await admin.rpc("commit_roleplay_recording", recordings[1]));
  assert(
    (
      await admin
        .from("accepted_recordings")
        .update({ duration_ms: 2000 })
        .eq("id", recordings[0].p_recording_id)
    ).error,
    "Accepted recording is immutable after completion",
  );

  for (const [name, args] of [
    ["complete_analysis_job", { p_job_id: jobs[0].id }],
    ["requeue_analysis_job", { p_job_id: jobs[0].id }],
    [
      "fail_analysis_job",
      {
        p_job_id: jobs[0].id,
        p_error_code: "TEST",
        p_error_message: "Test",
        p_error_log_ref: null,
      },
    ],
  ])
    assert((await admin.rpc(name, args)).error, `Legacy RPC ${name} must be disabled`);
  assert(
    (
      await admin.from("practice_target_analysis_results").insert({
        user_id: ownerId,
        analysis_job_id: jobs[0].id,
        roleplay_session_id: sessionId,
        roleplay_line_id: lines[0],
        transcript: "Legacy",
        feedback: {},
        score: 100,
      })
    ).error,
    "Legacy unfenced result insert must be rejected",
  );
  const claim = randomUUID();
  accepted(
    await admin
      .from("analysis_jobs")
      .update({ status: "processing", claim_token: claim, started_at: new Date().toISOString() })
      .eq("id", jobs[0].id),
  );
  const staleClaim = randomUUID();
  assert(
    (
      await admin.rpc("save_claimed_analysis_result", {
        p_job_id: jobs[0].id,
        p_claim_token: staleClaim,
        p_result: {},
      })
    ).error,
    "Stale claim cannot save results",
  );
  const staleTransition = accepted(
    await admin.rpc("transition_claimed_analysis_job", {
      p_job_id: jobs[0].id,
      p_claim_token: staleClaim,
      p_status: "completed",
    }),
  );
  assert.equal(staleTransition.length, 0);
  assert.equal(
    accepted(await admin.from("analysis_jobs").select("status").eq("id", jobs[0].id).single())
      .status,
    "processing",
  );
  accepted(
    await admin.rpc("save_claimed_analysis_result", {
      p_job_id: jobs[0].id,
      p_claim_token: claim,
      p_result: { roleplay_line_id: lines[0], transcript: "Hello", feedback: {}, score: 100 },
    }),
  );
  accepted(
    await admin.rpc("transition_claimed_analysis_job", {
      p_job_id: jobs[0].id,
      p_claim_token: claim,
      p_status: "failed",
      p_error_message: "Partial",
    }),
  );
  assert.equal(
    accepted(
      await admin
        .from("practice_target_analysis_results")
        .select("id")
        .eq("analysis_job_id", jobs[0].id),
    ).length,
    1,
  );
  console.info(
    "PASS local RPC: ownership, order, idempotency, completion, immutability, claim fencing",
  );
} finally {
  // 생성한 테스트 세션만 정리한다. 완료 녹음 불변성 트리거를 고려해 상태를 먼저 복원한다.
  accepted(
    await admin.from("roleplay_sessions").update({ status: "in_progress" }).eq("id", sessionId),
  );
  if (uploadedPaths.length) accepted(await admin.storage.from("recordings").remove(uploadedPaths));
  for (const id of userIds) accepted(await admin.auth.admin.deleteUser(id));
}
