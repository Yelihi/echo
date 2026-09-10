import type { RecordCleanupFailureInput, CreateCleanupFailureInput } from "../../models/cleanup";
// 정리 실패 로그가 원래 저장 오류를 가리지 않도록 기록 실패는 전파하지 않는다.
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
    // 로그 장애는 원래 저장 오류보다 우선하지 않는다.
  }
}

export function getCleanupErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createCleanupFailureInput(
  input: CreateCleanupFailureInput,
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
