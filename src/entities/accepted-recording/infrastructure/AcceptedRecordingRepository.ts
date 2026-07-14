import type { SupabaseClient } from "@supabase/supabase-js";

import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import { mapAcceptedRecordingRowToEntity } from "@/entities/accepted-recording/models/mapper";
import type {
  AcceptedRecordingRepositoryPort,
  UpsertAcceptedRecordingFromDraftInput,
} from "@/entities/accepted-recording/models/repository";
import type { LineId, RecordingId, SentenceId, SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export class AcceptedRecordingRepository implements AcceptedRecordingRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async upsertFromDraft(input: UpsertAcceptedRecordingFromDraftInput): Promise<AcceptedRecording> {
    const existingRecording =
      input.practiceType === "roleplay"
        ? await this.findByRoleplayTarget(input.roleplaySessionId, input.roleplayLineId)
        : await this.findByMemorizationTarget(
            input.memorizationSessionId,
            input.memorizationSentenceId,
          );
    const storagePayload = {
      bucket_id: input.bucketId,
      object_path: input.objectPath,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      duration_ms: input.durationMs,
    };

    if (existingRecording) {
      const { data, error } = await this.supabase
        .from("accepted_recordings")
        .update(storagePayload)
        .eq("id", existingRecording.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to update accepted recording: ${error.message}`);
      }

      return mapAcceptedRecordingRowToEntity(data);
    }

    const targetPayload =
      input.practiceType === "roleplay"
        ? {
            roleplay_session_id: input.roleplaySessionId,
            roleplay_line_id: input.roleplayLineId,
            memorization_session_id: null,
            memorization_sentence_id: null,
          }
        : {
            roleplay_session_id: null,
            roleplay_line_id: null,
            memorization_session_id: input.memorizationSessionId,
            memorization_sentence_id: input.memorizationSentenceId,
          };
    const { data, error } = await this.supabase
      .from("accepted_recordings")
      .insert({
        user_id: input.ownerId,
        ...targetPayload,
        ...storagePayload,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to upsert accepted recording: ${error.message}`);
    }

    return mapAcceptedRecordingRowToEntity(data);
  }

  async findByStorageObject(
    bucketId: string,
    objectPath: string,
  ): Promise<AcceptedRecording | null> {
    const { data, error } = await this.supabase
      .from("accepted_recordings")
      .select("*")
      .eq("bucket_id", bucketId)
      .eq("object_path", objectPath)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch accepted recording by storage object: ${error.message}`);
    }

    return data ? mapAcceptedRecordingRowToEntity(data) : null;
  }

  async findById(id: RecordingId): Promise<AcceptedRecording | null> {
    const { data, error } = await this.supabase
      .from("accepted_recordings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch accepted recording: ${error.message}`);
    }

    return data ? mapAcceptedRecordingRowToEntity(data) : null;
  }

  async findByRoleplayTarget(
    sessionId: SessionId,
    lineSnapshotId: LineId,
  ): Promise<AcceptedRecording | null> {
    const { data, error } = await this.supabase
      .from("accepted_recordings")
      .select("*")
      .eq("roleplay_session_id", sessionId)
      .eq("roleplay_line_id", lineSnapshotId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch accepted recording by roleplay target: ${error.message}`);
    }

    return data ? mapAcceptedRecordingRowToEntity(data) : null;
  }

  async findByMemorizationTarget(
    sessionId: SessionId,
    sentenceSnapshotId: SentenceId,
  ): Promise<AcceptedRecording | null> {
    const { data, error } = await this.supabase
      .from("accepted_recordings")
      .select("*")
      .eq("memorization_session_id", sessionId)
      .eq("memorization_sentence_id", sentenceSnapshotId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to fetch accepted recording by memorization target: ${error.message}`,
      );
    }

    return data ? mapAcceptedRecordingRowToEntity(data) : null;
  }
}

export function createAcceptedRecordingRepository(
  supabase: SupabaseClient<Database>,
): AcceptedRecordingRepositoryPort {
  return new AcceptedRecordingRepository(supabase);
}
