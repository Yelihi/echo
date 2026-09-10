import type { RecordOperationEvent, ObserveOperationInput } from "./models";

export async function observeOperation<Result>(
  input: ObserveOperationInput<Result>,
): Promise<Result> {
  const context = {
    operation: input.operation,
    resourceId: input.resourceId,
    operationId: crypto.randomUUID(),
  };
  const startedAt = performance.now();
  const emit: RecordOperationEvent = (event) => {
    try {
      input.recordEvent(event);
    } catch {
      // 로그 장애가 이미 확정된 업무 결과를 실패로 바꾸면 재시도로 중복 처리가 발생한다.
    }
  };
  emit({ ...context, phase: "started" });
  try {
    const result = await input.execute();
    emit({ ...context, phase: "succeeded", durationMs: performance.now() - startedAt });
    return result;
  } catch (error) {
    emit({ ...context, phase: "failed", durationMs: performance.now() - startedAt });
    throw error;
  }
}
