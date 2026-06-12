export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type UserId = Brand<string, "UserId">;
export type MaterialId = Brand<string, "MaterialId">;
export type SessionId = Brand<string, "SessionId">;
export type SpeakerId = Brand<string, "SpeakerId">;
export type LineId = Brand<string, "LineId">;
export type ParagraphId = Brand<string, "ParagraphId">;
export type SentenceId = Brand<string, "SentenceId">;
export type RecordingId = Brand<string, "RecordingId">;
export type AnalysisJobId = Brand<string, "AnalysisJobId">;

export interface TagValue {
  readonly displayName: string;
  readonly normalizedName: string;
}

export interface RecordingAudio {
  readonly bucketId: string;
  readonly objectPath: string;
  readonly mimeType: `audio/${string}`;
  readonly sizeBytes: number;
  readonly durationMs: number | null;
}

export function createTagValue(input: string): TagValue {
  const displayName = input.trim().replace(/\s+/g, " ");

  if (!displayName) {
    throw new Error("Tag name cannot be empty");
  }

  return {
    displayName,
    normalizedName: displayName.toLocaleLowerCase(),
  };
}
