import { deserialize, serialize } from "node:v8";

import "@testing-library/jest-dom";

if (typeof globalThis.structuredClone !== "function") {
  globalThis.structuredClone = <T>(value: T): T => deserialize(serialize(value)) as T;
}
