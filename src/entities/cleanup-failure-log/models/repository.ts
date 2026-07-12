import type { CleanupFailureLog } from "@/entities/cleanup-failure-log/models/entity";
import type { CleanupFailureSource } from "@/entities/cleanup-failure-log/models/enums";
import type { UserId } from "@/entities/value-object";

export interface FindCleanupFailureLogsParams {
  readonly limit?: number;
}

export interface CreateCleanupFailureLogInput {
  readonly source: CleanupFailureSource;
  readonly userId: UserId;
  readonly bucketId: string;
  readonly objectPath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly durationMs: number | null;
  readonly errorMessage: string;
}

export interface CleanupFailureLogRepositoryPort {
  create(input: CreateCleanupFailureLogInput): Promise<CleanupFailureLog>;
  findById(id: string): Promise<CleanupFailureLog | null>;
  findMany(params?: FindCleanupFailureLogsParams): Promise<CleanupFailureLog[]>;
}
