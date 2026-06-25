export type STTProviderErrorCode =
  | "unsupported-audio-format"
  | "empty-transcript"
  | "provider-rate-limited"
  | "provider-auth-failed"
  | "provider-bad-request"
  | "provider-unavailable"
  | "provider-failed";

export interface STTProviderErrorOptions {
  readonly retryable: boolean;
  readonly cause?: unknown;
}

export class STTProviderError extends Error {
  readonly code: STTProviderErrorCode;
  readonly retryable: boolean;
  override readonly cause?: unknown;

  constructor(code: STTProviderErrorCode, message: string, options: STTProviderErrorOptions) {
    super(message);
    this.name = "STTProviderError";
    this.code = code;
    this.retryable = options.retryable;
    this.cause = options.cause;
  }
}

export function mapToSTTProviderError(cause: unknown): STTProviderError {
  if (cause instanceof STTProviderError) {
    return cause;
  }

  const status = getErrorStatus(cause);

  if (status === 429) {
    return new STTProviderError("provider-rate-limited", "STT provider rate limit exceeded.", {
      retryable: true,
      cause,
    });
  }

  if (status === 401 || status === 403) {
    return new STTProviderError("provider-auth-failed", "STT provider authentication failed.", {
      retryable: false,
      cause,
    });
  }

  if (status === 400 || status === 404 || status === 422) {
    return new STTProviderError("provider-bad-request", "STT provider rejected the request.", {
      retryable: false,
      cause,
    });
  }

  if (status && status >= 500) {
    return new STTProviderError("provider-unavailable", "STT provider is unavailable.", {
      retryable: true,
      cause,
    });
  }

  return new STTProviderError("provider-failed", "STT provider failed.", {
    retryable: true,
    cause,
  });
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return null;
  }

  const status = error.status;
  return typeof status === "number" ? status : null;
}
