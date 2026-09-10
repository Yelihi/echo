import type {
  AnalysisEvent,
  RecordAnalysisEvent,
  ObserveAnalysisOperationInput,
} from "./models/logging.ts";
export const recordAnalysisEvent: RecordAnalysisEvent = (event) => {
  console.info(
    JSON.stringify({
      service: "echo-analysis-worker",
      time: Date.now(),
      ...event,
    }),
  );
};

export async function observeAnalysisOperation<Result>(
  input: ObserveAnalysisOperationInput<Result>,
): Promise<Result> {
  const context = {
    operation: input.operation,
    jobId: input.jobId,
    targetId: input.targetId,
    operationId: crypto.randomUUID(),
  };
  const startedAt = performance.now();
  const emit = (phase: AnalysisEvent["phase"]) => {
    try {
      (input.recordEvent ?? recordAnalysisEvent)({
        ...context,
        phase,
        durationMs: performance.now() - startedAt,
      });
    } catch {
      // 로그 전송 실패로 분석 결과를 폐기하거나 재실행하지 않는다.
    }
  };
  emit("started");
  try {
    const result = await input.execute();
    emit("succeeded");
    return result;
  } catch (error) {
    emit("failed");
    throw error;
  }
}
