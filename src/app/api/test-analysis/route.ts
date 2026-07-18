import { NextResponse } from "next/server";

import type { AcceptedRecording } from "@/entities/accepted-recording";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import { createCleanupFailureLogRepository } from "@/entities/cleanup-failure-log";
import { createDraftRecordingRepository } from "@/entities/draft-recording";
import type { LineId, SentenceId, SessionId, UserId } from "@/entities/value-object";
import {
  acceptDraftRecording,
  createDraftRecording,
} from "@/features/recording-storage/services/server";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import type { Database } from "@/shared/lib/supabase";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { authorizeTestAnalysisApi } from "@/shared/lib/test-analysis/guard";

type PracticeTypeInput = "roleplay" | "memorization";
type AcceptedRecordingRow = Database["public"]["Tables"]["accepted_recordings"]["Row"];

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
  const contentType = contentTypeFromFile(file);
  const storage = new RecordingStorageService(supabase);
  const draftRepository = createDraftRecordingRepository(supabase);
  const acceptedRepository = createAcceptedRecordingRepository(supabase);
  const cleanupFailureLogRepository = createCleanupFailureLogRepository(supabase);
  const recordingFile = file.type === contentType ? file : new Blob([file], { type: contentType });

  try {
    const recording = await createAcceptedRecordingForTestAnalysis({
      userId,
      practiceType,
      sessionId,
      targetId,
      file: recordingFile,
      durationMs,
      storage,
      draftRepository,
      cleanupFailureLogRepository,
      acceptedRepository,
    });

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

    return NextResponse.json({ recording, job });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function contentTypeFromFile(file: File): string {
  return file.type.split(";")[0] || "audio/webm";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function createAcceptedRecordingForTestAnalysis(input: {
  readonly userId: string;
  readonly practiceType: PracticeTypeInput;
  readonly sessionId: string;
  readonly targetId: string;
  readonly file: Blob;
  readonly durationMs: number;
  readonly storage: RecordingStorageService;
  readonly draftRepository: Parameters<typeof createDraftRecording>[0]["draftRepository"];
  readonly acceptedRepository: Parameters<typeof acceptDraftRecording>[0]["acceptedRepository"];
  readonly cleanupFailureLogRepository: Parameters<
    typeof createDraftRecording
  >[0]["cleanupFailureLogRepository"];
}): Promise<AcceptedRecordingRow> {
  const draftRecording = await createDraftRecording({
    userId: input.userId as UserId,
    target:
      input.practiceType === "roleplay"
        ? {
            practiceType: "roleplay",
            sessionId: input.sessionId as SessionId,
            lineSnapshotId: input.targetId as LineId,
          }
        : {
            practiceType: "memorization",
            sessionId: input.sessionId as SessionId,
            sentenceSnapshotId: input.targetId as SentenceId,
          },
    file: input.file,
    durationMs: input.durationMs > 0 ? Math.round(input.durationMs) : null,
    storage: input.storage,
    draftRepository: input.draftRepository,
    cleanupFailureLogRepository: input.cleanupFailureLogRepository,
  });

  const acceptedRecording = await acceptDraftRecording({
    userId: input.userId as UserId,
    draftRecordingId: draftRecording.id,
    draftRepository: input.draftRepository,
    acceptedRepository: input.acceptedRepository,
    storage: input.storage,
    cleanupFailureLogRepository: input.cleanupFailureLogRepository,
  });

  return serializeAcceptedRecordingRow(acceptedRecording);
}

function serializeAcceptedRecordingRow(recording: AcceptedRecording): AcceptedRecordingRow {
  return {
    id: recording.id,
    user_id: recording.ownerId,
    roleplay_session_id:
      recording.target.practiceType === "roleplay" ? recording.target.sessionId : null,
    roleplay_line_id:
      recording.target.practiceType === "roleplay" ? recording.target.lineSnapshotId : null,
    memorization_session_id:
      recording.target.practiceType === "memorization" ? recording.target.sessionId : null,
    memorization_sentence_id:
      recording.target.practiceType === "memorization" ? recording.target.sentenceSnapshotId : null,
    bucket_id: recording.audio.bucketId,
    object_path: recording.audio.objectPath,
    mime_type: recording.audio.mimeType,
    size_bytes: recording.audio.sizeBytes,
    duration_ms: recording.audio.durationMs,
    accepted_at: recording.acceptedAt.toISOString(),
    created_at: recording.createdAt.toISOString(),
    updated_at: recording.updatedAt.toISOString(),
  };
}
