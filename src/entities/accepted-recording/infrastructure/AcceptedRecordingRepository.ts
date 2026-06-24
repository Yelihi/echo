import type { SupabaseClient } from "@supabase/supabase-js";

import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import { mapAcceptedRecordingRowToEntity } from "@/entities/accepted-recording/models/mapper";
import type { AcceptedRecordingRepositoryPort } from "@/entities/accepted-recording/models/repository";
import type { LineId, RecordingId, SentenceId, SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export class AcceptedRecordingRepository implements AcceptedRecordingRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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
