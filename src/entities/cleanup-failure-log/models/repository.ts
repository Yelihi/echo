import type { CleanupFailureLog } from "@/entities/cleanup-failure-log/models/entity";

export interface FindCleanupFailureLogsParams {
  readonly limit?: number;
}

export interface CleanupFailureLogRepositoryPort {
  findById(id: string): Promise<CleanupFailureLog | null>;
  findMany(params?: FindCleanupFailureLogsParams): Promise<CleanupFailureLog[]>;
}
