import "server-only";
import pino from "pino";

import type { OperationEvent } from "./models";

const logger = pino({
  name: "echo-server",
  level: "info",
  base: { service: "echo-server" },
});

export const recordOperationEvent = (
  event: OperationEvent,
  diagnostics?: { stage: string; issues: { code: string; path: (string | number)[] }[] },
) => {
  const fields = {
    operation: event.operation,
    phase: event.phase,
    operationId: event.operationId,
    resourceId: event.resourceId,
    durationMs: event.durationMs,
    ...(diagnostics ? { diagnostics } : {}),
  };
  if (event.phase === "failed") logger.error(fields, `${event.operation}.${event.phase}`);
  else logger.info(fields, `${event.operation}.${event.phase}`);
};
