const knownCodes = new Set([
  "invalid_api_key",
  "insufficient_quota",
  "rate_limit_exceeded",
  "model_not_found",
  "invalid_json_schema",
  "invalid_value",
  "context_length_exceeded",
  "server_error",
  "QUOTA_FAILED",
  "AUDIO_PROCESSOR_UNAVAILABLE",
  "AI_RESPONSE_INCOMPLETE",
  "AI_RESPONSE_EMPTY",
  "INVALID_EXAMPLE_COUNT",
  "DUPLICATE_EXAMPLES",
  "REPEATED_EXAMPLES",
  "INVALID_DIRECT_READING",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "INVALID_INPUT",
  "INVALID_RESPONSE",
  "VERSION_CONFLICT",
  "PERSISTENCE_FAILED",
  "TTS_FAILED",
  "P0001",
]);

const codesByErrorName = new Map([
  ["ZodError", "INVALID_RESPONSE"],
  ["APIConnectionTimeoutError", "TIMEOUT"],
  ["FunctionsHttpError", "FUNCTION_HTTP_ERROR"],
  ["FunctionsFetchError", "FUNCTION_NETWORK_ERROR"],
]);

/** Only identifiers and schema paths: never log provider messages, request bodies or credentials. */
export function safeErrorDetails(
  error: unknown,
  depth = 0,
): {
  code: string;
  status?: number;
  requestId?: string;
  issues?: { code: string; path: (string | number)[] }[];
} {
  if (!error || typeof error !== "object") return { code: "UNKNOWN" };
  const value = error as Record<string, unknown>;
  if (value.cause && depth < 3) return safeErrorDetails(value.cause, depth + 1);
  const raw = typeof value.code === "string" ? value.code : value.message;
  let code = "UNKNOWN";
  if (
    typeof raw === "string" &&
    (knownCodes.has(raw) || /^PGRST\d{3}$/.test(raw) || /^[0-9][A-Z0-9]{4}$/.test(raw))
  ) {
    code = raw;
  } else if (typeof value.name === "string") {
    code = codesByErrorName.get(value.name) ?? "UNKNOWN";
  }
  const requestId = value.request_id;
  let status: number | undefined;
  if (typeof value.status === "number") {
    status = value.status;
  } else if (typeof Response !== "undefined" && value.context instanceof Response) {
    status = value.context.status;
  }
  return {
    code,
    ...(status !== undefined ? { status } : {}),
    ...(typeof requestId === "string" && /^req_[a-zA-Z0-9_-]{1,120}$/.test(requestId)
      ? { requestId }
      : {}),
    ...(value.name === "ZodError" && Array.isArray(value.issues)
      ? {
          issues: value.issues.slice(0, 5).map((issue) => ({ code: issue.code, path: issue.path })),
        }
      : {}),
  };
}
