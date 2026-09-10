import type { OperationEvent, OperationRecorderOptions, OperationEventRecorder } from "./models";

export function createOperationEventRecorder(
  options: OperationRecorderOptions = {},
): OperationEventRecorder {
  const events: OperationEvent[] = [];
  return {
    events,
    recordEvent(event) {
      events.push({ ...event });
      if (options.print) {
        console.info(
          `${String(events.length).padStart(2, "0")} ${event.operation}.${event.phase} resourceId=${event.resourceId}`,
        );
      }
    },
  };
}
