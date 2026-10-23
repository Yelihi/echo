// Local Supabase only: node supabase/tests/grammar_audio_storage.integration.mjs /tmp/local-status.json
import assert from "node:assert/strict";
import process from "node:process";
import { URL } from "node:url";
import console from "node:console";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const config = JSON.parse(readFileSync(process.argv[2], "utf8"));
assert(
  ["localhost", "127.0.0.1"].includes(new URL(config.API_URL).hostname),
  "Local Supabase required",
);
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, options);
const ownerClient = createClient(config.API_URL, config.ANON_KEY, options);
const otherClient = createClient(config.API_URL, config.ANON_KEY, options);
async function value(request) {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}
const users = [];
const paths = [];
const noteId = randomUUID();
const text = "She is not a teacher but a doctor.";
const content = {
  source: { sentence: text, learningNote: "not A but B", revision: 0 },
  metadata: {
    source: "ai",
    sourceRevision: 0,
    title: "Audio integration",
    tags: [],
    grammarKey: null,
  },
  analysis: {
    sourceText: text,
    sourceRevision: 0,
    chunks: [
      {
        id: "c1",
        range: { start: 0, end: text.length },
        literalMeaning: "그녀는",
        explanation: "설명",
      },
    ],
    syntax: [],
    constructions: [],
    naturalTranslation: "그녀는 교사가 아니라 의사입니다.",
    reviewStatus: "reviewed",
  },
  examples: [
    {
      id: "one",
      sentence: "Saved sentence.",
      translation: "저장한 문장",
      targetExplanation: "설명",
      reviewStatus: "reviewed",
    },
  ],
};
try {
  for (const client of [ownerClient, otherClient]) {
    const email = `${randomUUID()}@audio-test.local`;
    const password = randomUUID();
    const { user } = await value(
      admin.auth.admin.createUser({ email, password, email_confirm: true }),
    );
    users.push(user.id);
    await value(client.auth.signInWithPassword({ email, password }));
  }
  await value(
    admin.from("grammar_notes").insert({
      id: noteId,
      owner_id: users[0],
      content,
      creation_content: content,
      creation_request_id: randomUUID(),
    }),
  );
  const args = {
    p_owner_id: users[0],
    p_note_id: noteId,
    p_example_ids: ["one"],
    p_model: "tts-1",
    p_enqueue: true,
  };
  const registered = await Promise.all(
    Array.from({ length: 8 }, () => value(admin.rpc("example_audio_preparation", args))),
  );
  assert.equal(
    new Set(registered.map((rows) => rows[0].jobId)).size,
    1,
    "concurrent registration must share one job",
  );
  const claims = (
    await Promise.all(Array.from({ length: 4 }, () => value(admin.rpc("claim_grammar_audio_job"))))
  ).flat();
  assert.equal(claims.length, 1, "SKIP LOCKED must allow only one claimant");
  const first = claims[0];
  const attempt = await value(
    admin.from("grammar_audio_attempts").select("object_path").eq("id", first.claim_token).single(),
  );
  paths.push(attempt.object_path);
  await value(
    admin
      .from("grammar_audio_jobs")
      .update({ claimed_at: new Date(Date.now() - 11 * 60_000).toISOString() })
      .eq("id", first.id),
  );
  assert.equal((await value(admin.rpc("claim_grammar_audio_job"))).length, 0);
  await value(admin.rpc("example_audio_preparation", { ...args, p_retry: true }));
  const [second] = await value(admin.rpc("claim_grammar_audio_job"));
  const current = await value(
    admin
      .from("grammar_audio_attempts")
      .select("object_path")
      .eq("id", second.claim_token)
      .single(),
  );
  paths.push(current.object_path);
  assert.notEqual(attempt.object_path, current.object_path);
  const bytes = new Uint8Array([0x49, 0x44, 0x33, 1, 2, 3]);
  await value(
    admin.storage
      .from("grammar-audio")
      .upload(current.object_path, bytes, { contentType: "audio/mpeg", upsert: false }),
  );
  assert.equal(
    await value(
      admin.rpc("finish_grammar_audio_job", {
        p_job_id: second.id,
        p_claim_token: second.claim_token,
      }),
    ),
    true,
  );
  // The old worker uploads after the new asset is ready.
  await value(
    admin.storage.from("grammar-audio").upload(attempt.object_path, new Uint8Array([9]), {
      contentType: "audio/mpeg",
      upsert: false,
    }),
  );
  assert.equal(
    await value(
      admin.rpc("finish_grammar_audio_job", {
        p_job_id: first.id,
        p_claim_token: first.claim_token,
      }),
    ),
    false,
  );
  const [ready] = await value(
    admin.rpc("example_audio_preparation", { ...args, p_enqueue: false }),
  );
  assert.equal(ready.objectPath, current.object_path);
  const downloaded = await value(admin.storage.from("grammar-audio").download(ready.objectPath));
  assert.deepEqual(
    new Uint8Array(await downloaded.arrayBuffer()),
    bytes,
    "late upload cannot change ready bytes",
  );
  for (const client of [ownerClient, otherClient]) {
    assert(
      (await client.storage.from("grammar-audio").download(current.object_path)).error,
      "private storage must require trusted server",
    );
    assert(
      (await client.rpc("example_audio_preparation", args)).error,
      "browser cannot forge owner/model",
    );
  }
  assert(
    (await admin.rpc("example_audio_preparation", { ...args, p_owner_id: users[1] })).error,
    "trusted read still validates owner",
  );
  const orphan = await value(
    admin.from("grammar_audio_attempts").select("state").eq("id", first.claim_token).single(),
  );
  assert.equal(orphan.state, "cleanup_pending");
  await value(admin.storage.from("grammar-audio").remove(paths));
  assert(
    (await admin.storage.from("grammar-audio").download(current.object_path)).error,
    "Storage cleanup removes bytes",
  );
  console.log(
    "PASS: concurrent registration/claims, immutable late uploads, ready byte reuse, private access, owner validation, tracked orphan and Storage removal; no TTS called.",
  );
} finally {
  if (paths.length) await value(admin.storage.from("grammar-audio").remove(paths));
  const jobs = await value(admin.from("grammar_audio_jobs").select("id").eq("note_id", noteId));
  if (jobs.length)
    await value(
      admin
        .from("grammar_audio_attempts")
        .delete()
        .in(
          "job_id",
          jobs.map((job) => job.id),
        ),
    );
  await value(admin.from("grammar_audio_jobs").delete().eq("note_id", noteId));
  await value(admin.from("grammar_notes").delete().eq("id", noteId));
  for (const id of users) await value(admin.auth.admin.deleteUser(id));
}
