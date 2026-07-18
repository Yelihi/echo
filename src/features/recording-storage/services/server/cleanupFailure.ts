import type { CleanupFailureSource } from "@/entities/cleanup-failure-log";
import type {
  CleanupFailureLogRepositoryPort,
  CreateCleanupFailureLogInput,
} from "@/entities/cleanup-failure-log/models/repository";

export interface RecordCleanupFailureInput extends CreateCleanupFailureLogInput {
  readonly repository?: CleanupFailureLogRepositoryPort;
}

/**
 * Cleanup logging is best-effort.
 * A logging failure must not hide the storage failure that the caller needs to handle.
 */
export async function recordCleanupFailure(input: RecordCleanupFailureInput): Promise<void> {
  try {
    await input.repository?.create({
      source: input.source,
      userId: input.userId,
      bucketId: input.bucketId,
      objectPath: input.objectPath,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      durationMs: input.durationMs,
      errorMessage: input.errorMessage,
    });
  } catch {
    // Intentionally ignored. Cleanup retry visibility must not mask the primary failure.
  }
}

export function getCleanupErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createCleanupFailureInput(
  input: Omit<CreateCleanupFailureLogInput, "source" | "errorMessage"> & {
    readonly source: CleanupFailureSource;
    readonly error: unknown;
    readonly repository?: CleanupFailureLogRepositoryPort;
  },
): RecordCleanupFailureInput {
  return {
    repository: input.repository,
    source: input.source,
    userId: input.userId,
    bucketId: input.bucketId,
    objectPath: input.objectPath,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    durationMs: input.durationMs,
    errorMessage: getCleanupErrorMessage(input.error),
  };
}
