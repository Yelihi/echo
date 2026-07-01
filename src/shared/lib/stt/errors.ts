import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export const STT_PROVIDER_ERROR_CODE = {
  UNSUPPORTED_AUDIO_FORMAT: "STT-001",
  EMPTY_TRANSCRIPT: "STT-002",
  PROVIDER_RATE_LIMITED: "STT-003",
  PROVIDER_AUTH_FAILED: "STT-004",
  PROVIDER_BAD_REQUEST: "STT-005",
  PROVIDER_UNAVAILABLE: "STT-006",
  PROVIDER_FAILED: "STT-007",
} as const;

export type STTProviderErrorCode =
  (typeof STT_PROVIDER_ERROR_CODE)[keyof typeof STT_PROVIDER_ERROR_CODE];

export interface STTProviderErrorOptions {
  readonly retryable: boolean;
  readonly cause?: unknown;
}

export abstract class STTProviderError extends CustomError {
  readonly retryable: boolean;

  protected constructor(
    code: STTProviderErrorCode,
    message: string,
    options: STTProviderErrorOptions,
  ) {
    super(code, message, { cause: options.cause });
    this.retryable = options.retryable;
  }
}

export class STTUnsupportedAudioFormatError extends STTProviderError {
  constructor(extension: string, options: CustomErrorOptions = {}) {
    super(
      STT_PROVIDER_ERROR_CODE.UNSUPPORTED_AUDIO_FORMAT,
      `Unsupported STT audio format: ${extension || "unknown"}.`,
      {
        retryable: false,
        cause: options.cause,
      },
    );
  }
}

export class STTEmptyTranscriptError extends STTProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(STT_PROVIDER_ERROR_CODE.EMPTY_TRANSCRIPT, "STT provider returned an empty transcript.", {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class STTProviderRateLimitedError extends STTProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(STT_PROVIDER_ERROR_CODE.PROVIDER_RATE_LIMITED, "STT provider rate limit exceeded.", {
      retryable: true,
      cause: options.cause,
    });
  }
}

export class STTProviderAuthFailedError extends STTProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(STT_PROVIDER_ERROR_CODE.PROVIDER_AUTH_FAILED, "STT provider authentication failed.", {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class STTProviderBadRequestError extends STTProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(STT_PROVIDER_ERROR_CODE.PROVIDER_BAD_REQUEST, "STT provider rejected the request.", {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class STTProviderUnavailableError extends STTProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(STT_PROVIDER_ERROR_CODE.PROVIDER_UNAVAILABLE, "STT provider is unavailable.", {
      retryable: true,
      cause: options.cause,
    });
  }
}

export class STTProviderFailedError extends STTProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(STT_PROVIDER_ERROR_CODE.PROVIDER_FAILED, "STT provider failed.", {
      retryable: true,
      cause: options.cause,
    });
  }
}

export function mapToSTTProviderError(cause: unknown): STTProviderError {
  if (cause instanceof STTProviderError) {
    return cause;
  }

  const status = getErrorStatus(cause);

  if (status === 429) {
    return new STTProviderRateLimitedError({ cause });
  }

  if (status === 401 || status === 403) {
    return new STTProviderAuthFailedError({ cause });
  }

  if (status === 400 || status === 404 || status === 422) {
    return new STTProviderBadRequestError({ cause });
  }

  if (status && status >= 500) {
    return new STTProviderUnavailableError({ cause });
  }

  return new STTProviderFailedError({ cause });
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return null;
  }

  const status = error.status;
  return typeof status === "number" ? status : null;
}
