import "server-only";
import pino from "pino";

import type { RecordOperationEvent } from "./models";

const logger = pino({
  name: "echo-server",
  level: "info",
  base: { service: "echo-server" },
});

export const recordOperationEvent: RecordOperationEvent = (event) => {
  const fields = {
    operation: event.operation,
    phase: event.phase,
    operationId: event.operationId,
    resourceId: event.resourceId,
    durationMs: event.durationMs,
  };
  if (event.phase === "failed") logger.error(fields, `${event.operation}.${event.phase}`);
  else logger.info(fields, `${event.operation}.${event.phase}`);
};
