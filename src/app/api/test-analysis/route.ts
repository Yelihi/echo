import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import type { Database } from "@/shared/lib/supabase";
import { authorizeTestAnalysisApi } from "@/shared/lib/test-analysis/guard";

const RECORDINGS_BUCKET = "recordings";
type AcceptedRecordingInsert = Database["public"]["Tables"]["accepted_recordings"]["Insert"];

export async function POST(request: Request) {
  const { auth, response } = await authorizeTestAnalysisApi();

  if (response) {
    return response;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const userId = readString(formData, "userId");
  const practiceType = readString(formData, "practiceType");
  const sessionId = readString(formData, "sessionId");
  const targetId = readString(formData, "targetId");
  const durationMs = Number(readString(formData, "durationMs") || 0);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!userId || !sessionId || !targetId) {
    return NextResponse.json(
      { error: "userId, sessionId, targetId are required" },
      { status: 400 },
    );
  }

  if (userId !== auth.userId) {
    return NextResponse.json(
      { error: "Cannot upload recordings for another user." },
      { status: 403 },
    );
  }

  if (practiceType !== "roleplay" && practiceType !== "memorization") {
    return NextResponse.json(
      { error: "practiceType must be roleplay or memorization" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceRoleClient();
  await ensureRecordingsBucket();

  const extension = extensionFromFile(file);
  const contentType = contentTypeFromFile(file);
  const objectPath = `test/${userId}/${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from(RECORDINGS_BUCKET).upload(objectPath, file, {
    contentType,
  });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const recordingRow: AcceptedRecordingInsert =
    practiceType === "roleplay"
      ? {
          user_id: userId,
          roleplay_session_id: sessionId,
          roleplay_line_id: targetId,
          memorization_session_id: null,
          memorization_sentence_id: null,
          bucket_id: RECORDINGS_BUCKET,
          object_path: objectPath,
          mime_type: contentType,
          size_bytes: file.size,
          duration_ms: durationMs > 0 ? Math.round(durationMs) : null,
        }
      : {
          user_id: userId,
          roleplay_session_id: null,
          roleplay_line_id: null,
          memorization_session_id: sessionId,
          memorization_sentence_id: targetId,
          bucket_id: RECORDINGS_BUCKET,
          object_path: objectPath,
          mime_type: contentType,
          size_bytes: file.size,
          duration_ms: durationMs > 0 ? Math.round(durationMs) : null,
        };

  const existing = await findAcceptedRecording(practiceType, sessionId, targetId);
  const savedRecording = existing
    ? await supabase
        .from("accepted_recordings")
        .update(recordingRow)
        .eq("id", existing.id)
        .select("*")
        .single()
    : await supabase.from("accepted_recordings").insert(recordingRow).select("*").single();

  if (savedRecording.error) {
    return NextResponse.json({ error: savedRecording.error.message }, { status: 500 });
  }

  const { data: job, error: jobError } = await supabase
    .rpc("request_analysis_job", {
      p_user_id: userId,
      p_roleplay_session_id: practiceType === "roleplay" ? sessionId : null,
      p_memorization_session_id: practiceType === "memorization" ? sessionId : null,
      p_provider: "openai",
    })
    .maybeSingle();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  return NextResponse.json({ recording: savedRecording.data, job });
}

async function ensureRecordingsBucket(): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const bucket = await supabase.storage.getBucket(RECORDINGS_BUCKET);

  if (!bucket.error) {
    return;
  }

  const created = await supabase.storage.createBucket(RECORDINGS_BUCKET, {
    public: false,
    fileSizeLimit: "50MB",
    allowedMimeTypes: ["audio/webm", "audio/mp4", "audio/aac", "audio/wav"],
  });

  if (created.error) {
    throw created.error;
  }
}

async function findAcceptedRecording(practiceType: string, sessionId: string, targetId: string) {
  const supabase = getSupabaseServiceRoleClient();
  const query =
    practiceType === "roleplay"
      ? supabase
          .from("accepted_recordings")
          .select("id")
          .eq("roleplay_session_id", sessionId)
          .eq("roleplay_line_id", targetId)
      : supabase
          .from("accepted_recordings")
          .select("id")
          .eq("memorization_session_id", sessionId)
          .eq("memorization_sentence_id", targetId);
  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function extensionFromFile(file: File): string {
  const filenameExtension = file.name.split(".").at(-1);

  if (filenameExtension) {
    return filenameExtension;
  }

  return file.type.includes("mp4") ? "mp4" : "webm";
}

function contentTypeFromFile(file: File): string {
  return file.type.split(";")[0] || "audio/webm";
}
