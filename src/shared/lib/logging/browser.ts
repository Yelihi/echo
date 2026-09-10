import type { RecordOperationEvent } from "./models";

export const recordBrowserOperationEvent: RecordOperationEvent = (event) => {
  console.info(JSON.stringify({ service: "echo-browser", time: Date.now(), ...event }));
};
