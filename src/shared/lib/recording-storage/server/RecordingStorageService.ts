import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/shared/lib/supabase";

import { RecordingStorageOperationError } from "./errors";

const RECORDINGS_BUCKET = "recordings";
const PLAYBACK_URL_TTL_SECONDS = 600;

export class RecordingStorageService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async upload(input: { objectPath: string; file: Blob; contentType: string }): Promise<void> {
    const { error } = await this.supabase.storage
      .from(RECORDINGS_BUCKET)
      .upload(input.objectPath, input.file, {
        contentType: input.contentType,
        upsert: false,
      });

    if (error) {
      throw new RecordingStorageOperationError("upload", { cause: error });
    }
  }

  async createSignedPlaybackUrl(
    objectPath: string,
  ): Promise<{ signedUrl: string; expiresInSeconds: number }> {
    const { data, error } = await this.supabase.storage
      .from(RECORDINGS_BUCKET)
      .createSignedUrl(objectPath, PLAYBACK_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      throw new RecordingStorageOperationError("create signed playback URL", {
        cause: error,
      });
    }

    return {
      signedUrl: data.signedUrl,
      expiresInSeconds: PLAYBACK_URL_TTL_SECONDS,
    };
  }

  async remove(objectPath: string): Promise<void> {
    const { error } = await this.supabase.storage.from(RECORDINGS_BUCKET).remove([objectPath]);

    if (error) {
      throw new RecordingStorageOperationError("remove", { cause: error });
    }
  }
}
