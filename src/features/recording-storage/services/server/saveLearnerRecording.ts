import "server-only";
import { createHash } from "node:crypto";
import {
  learnerRecordingSchema,
  type RoleplayRecordingContext,
} from "../../models/roleplayRecording";
import { recordingRpcFailureResponse } from "./recordingRpcFailure";
export async function saveLearnerRecording(
  form: FormData,
  { authClient, supabase, userId, sessionId, sessionStatus }: RoleplayRecordingContext,
): Promise<Response> {
  const recording = learnerRecordingSchema.safeParse(Object.fromEntries(form));
  const file = form.get("file");
  if (!recording.success || !(file instanceof File) || !file.size || file.size > 25 * 1024 * 1024) {
    return Response.json({ error: "Invalid audio" }, { status: 400 });
  }
  const mime = file.type.split(";")[0];
  if (!["audio/webm", "audio/mp4", "audio/aac", "audio/wav"].includes(mime)) {
    return Response.json({ error: "Unsupported audio" }, { status: 400 });
  }
  const { recordingId, lineId, durationMs } = recording.data;
  const { data: line } = await authClient
    .from("roleplay_session_lines")
    .select("id")
    .eq("session_id", sessionId)
    .eq("id", lineId)
    .maybeSingle();
  if (!line) return Response.json({ error: "Invalid target" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  const path = `${userId}/${sessionId}/${recordingId}-${digest}.${mime.split("/")[1]}`;
  const { data: existing } = await supabase
    .from("accepted_recordings")
    .select("id,object_path,roleplay_line_id")
    .eq("id", recordingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing)
    return Response.json(
      existing.object_path === path && existing.roleplay_line_id === lineId
        ? { saved: true }
        : { code: "RECORDING_CONFLICT" },
      { status: existing.object_path === path && existing.roleplay_line_id === lineId ? 200 : 409 },
    );
  if (sessionStatus === "completed")
    return Response.json({ code: "RECORDING_CONFLICT" }, { status: 409 });
  const { error: uploadError } = await supabase.storage
    .from("recordings")
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (uploadError && (!("statusCode" in uploadError) || String(uploadError.statusCode) !== "409")) {
    return Response.json({ error: "Upload failed" }, { status: 502 });
  }
  const { error } = await supabase.rpc("commit_roleplay_recording", {
    p_user_id: userId,
    p_session_id: sessionId,
    p_line_id: lineId,
    p_recording_id: recordingId,
    p_object_path: path,
    p_mime_type: mime,
    p_size_bytes: file.size,
    p_duration_ms: durationMs,
  });
  // 응답 유실일 수 있으므로 확정 실패 응답만 보고 업로드 파일을 삭제하지 않는다.
  return error ? recordingRpcFailureResponse(error) : Response.json({ saved: true });
}
