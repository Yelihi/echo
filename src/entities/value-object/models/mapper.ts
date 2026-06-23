import type { RecordingAudio } from "@/entities/value-object/models/value-objects";

export interface RecordingAudioFields {
  readonly bucket_id: string;
  readonly object_path: string;
  readonly mime_type: string;
  readonly size_bytes: number;
  readonly duration_ms: number | null;
}

export function mapRecordingAudioFields(
  fields: RecordingAudioFields,
  errorLabel: string,
): RecordingAudio {
  if (!fields.mime_type.startsWith("audio/")) {
    throw new Error(`Invalid ${errorLabel} mime type: ${fields.mime_type}`);
  }

  return {
    bucketId: fields.bucket_id,
    objectPath: fields.object_path,
    mimeType: fields.mime_type as `audio/${string}`,
    sizeBytes: fields.size_bytes,
    durationMs: fields.duration_ms,
  };
}
