import type { OperationEvent, RecordOperationEvent } from "./models";

export function emitOperationEvent(recordEvent: RecordOperationEvent, event: OperationEvent): void {
  try {
    recordEvent(event);
  } catch {
    // 로그 장애가 녹음이나 저장의 성공 여부를 바꾸면 안 된다.
  }
}
