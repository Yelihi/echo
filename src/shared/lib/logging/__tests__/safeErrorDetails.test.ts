/** @jest-environment node */
import { expect, it } from "@jest/globals";
import { safeErrorDetails } from "../safeErrorDetails";

it.each([
  ["ZodError", "INVALID_RESPONSE"],
  ["APIConnectionTimeoutError", "TIMEOUT"],
  ["FunctionsHttpError", "FUNCTION_HTTP_ERROR"],
  ["FunctionsFetchError", "FUNCTION_NETWORK_ERROR"],
  ["UnknownError", "UNKNOWN"],
  ["__proto__", "UNKNOWN"],
])("maps %s without logging arbitrary messages", (name, code) => {
  expect(safeErrorDetails({ name, message: "private sentence and token" })).toEqual({ code });
});

it("preserves the allowlist and code-before-name priority", () => {
  for (const code of ["rate_limit_exceeded", "PGRST202", "23505"]) {
    expect(safeErrorDetails({ code, name: "ZodError" })).toEqual({ code });
  }
  expect(safeErrorDetails({ message: "QUOTA_FAILED" })).toEqual({ code: "QUOTA_FAILED" });
  expect(safeErrorDetails({ code: "private", message: "QUOTA_FAILED", name: "ZodError" })).toEqual({
    code: "INVALID_RESPONSE",
  });
});

it("prefers explicit status and only accepts bounded request identifiers", () => {
  const context = new Response("private token", { status: 401 });
  expect(safeErrorDetails({ status: 429, context, request_id: "req_valid-1" })).toEqual({
    code: "UNKNOWN",
    status: 429,
    requestId: "req_valid-1",
  });
  expect(safeErrorDetails({ context, request_id: "private token" })).toEqual({
    code: "UNKNOWN",
    status: 401,
  });
});

it("keeps the cause depth limit and bounded schema issue projection", () => {
  const leaf = { code: "NOT_FOUND", cause: { code: "UNAUTHORIZED" } };
  expect(safeErrorDetails({ cause: { cause: { cause: leaf } } })).toEqual({ code: "NOT_FOUND" });
  expect(
    safeErrorDetails({
      name: "ZodError",
      issues: Array.from({ length: 6 }, () => ({
        code: "invalid_type",
        path: ["items", 0],
        message: "private token",
      })),
    }),
  ).toEqual({
    code: "INVALID_RESPONSE",
    issues: Array.from({ length: 5 }, () => ({
      code: "invalid_type",
      path: ["items", 0],
    })),
  });
});
