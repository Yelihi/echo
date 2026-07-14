import type { SupabaseClient } from "@supabase/supabase-js";

import type { CleanupFailureLog } from "@/entities/cleanup-failure-log/models/entity";
import { mapCleanupFailureLogRowToEntity } from "@/entities/cleanup-failure-log/models/mapper";
import type {
  CleanupFailureLogRepositoryPort,
  CreateCleanupFailureLogInput,
  FindCleanupFailureLogsParams,
} from "@/entities/cleanup-failure-log/models/repository";
import type { Database } from "@/shared/lib/supabase";

export class CleanupFailureLogRepository implements CleanupFailureLogRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(input: CreateCleanupFailureLogInput): Promise<CleanupFailureLog> {
    const { data, error } = await this.supabase
      .from("cleanup_failure_logs")
      .insert({
        source: input.source,
        user_id: input.userId,
        bucket_id: input.bucketId,
        object_path: input.objectPath,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
        duration_ms: input.durationMs,
        error_message: input.errorMessage,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create cleanup failure log: ${error.message}`);
    }

    return mapCleanupFailureLogRowToEntity(data);
  }

  async findById(id: string): Promise<CleanupFailureLog | null> {
    const { data, error } = await this.supabase
      .from("cleanup_failure_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch cleanup failure log: ${error.message}`);
    }

    return data ? mapCleanupFailureLogRowToEntity(data) : null;
  }

  async findMany(params: FindCleanupFailureLogsParams = {}): Promise<CleanupFailureLog[]> {
    let query = this.supabase
      .from("cleanup_failure_logs")
      .select("*")
      .order("attempted_at", { ascending: false });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch cleanup failure logs: ${error.message}`);
    }

    return data.map(mapCleanupFailureLogRowToEntity);
  }
}

export function createCleanupFailureLogRepository(
  supabase: SupabaseClient<Database>,
): CleanupFailureLogRepositoryPort {
  return new CleanupFailureLogRepository(supabase);
}
