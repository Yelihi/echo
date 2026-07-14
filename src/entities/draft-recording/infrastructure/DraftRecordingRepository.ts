import type { SupabaseClient } from "@supabase/supabase-js";

import type { LineId, RecordingId, SentenceId, SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";
import { mapDraftRecordingRowToEntity } from "@/entities/draft-recording/models/mapper";
import type {
  CreateDraftRecordingInput,
  DraftRecordingRepositoryPort,
} from "@/entities/draft-recording/models/repository";

export class DraftRecordingRepository implements DraftRecordingRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(input: CreateDraftRecordingInput): Promise<DraftRecording> {
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
      .from("draft_recordings")
      .insert({
        id: input.id,
        user_id: input.ownerId,
        ...targetPayload,
        bucket_id: input.bucketId,
        object_path: input.objectPath,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
        duration_ms: input.durationMs,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create draft recording: ${error.message}`);
    }

    return mapDraftRecordingRowToEntity(data);
  }

  async deleteById(id: RecordingId): Promise<void> {
    const { error } = await this.supabase.from("draft_recordings").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete draft recording: ${error.message}`);
    }
  }

  async findById(id: RecordingId): Promise<DraftRecording | null> {
    const { data, error } = await this.supabase
      .from("draft_recordings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch draft recording: ${error.message}`);
    }

    return data ? mapDraftRecordingRowToEntity(data) : null;
  }

  async findByRoleplayTarget(
    sessionId: SessionId,
    lineSnapshotId: LineId,
  ): Promise<DraftRecording | null> {
    const { data, error } = await this.supabase
      .from("draft_recordings")
      .select("*")
      .eq("roleplay_session_id", sessionId)
      .eq("roleplay_line_id", lineSnapshotId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch draft recording by roleplay target: ${error.message}`);
    }

    return data ? mapDraftRecordingRowToEntity(data) : null;
  }

  async findByMemorizationTarget(
    sessionId: SessionId,
    sentenceSnapshotId: SentenceId,
  ): Promise<DraftRecording | null> {
    const { data, error } = await this.supabase
      .from("draft_recordings")
      .select("*")
      .eq("memorization_session_id", sessionId)
      .eq("memorization_sentence_id", sentenceSnapshotId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch draft recording by memorization target: ${error.message}`);
    }

    return data ? mapDraftRecordingRowToEntity(data) : null;
  }
}

export function createDraftRecordingRepository(
  supabase: SupabaseClient<Database>,
): DraftRecordingRepositoryPort {
  return new DraftRecordingRepository(supabase);
}
