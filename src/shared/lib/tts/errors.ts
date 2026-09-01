import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export const TTS_PROVIDER_ERROR_CODE = {
  EMPTY_INPUT: "TTS-001",
  INVALID_VOICE: "TTS-002",
  INVALID_SPEED: "TTS-003",
  EMPTY_AUDIO: "TTS-004",
  PROVIDER_RATE_LIMITED: "TTS-005",
  PROVIDER_AUTH_FAILED: "TTS-006",
  PROVIDER_BAD_REQUEST: "TTS-007",
  PROVIDER_UNAVAILABLE: "TTS-008",
  PROVIDER_FAILED: "TTS-009",
} as const;

export type TtsProviderErrorCode =
  (typeof TTS_PROVIDER_ERROR_CODE)[keyof typeof TTS_PROVIDER_ERROR_CODE];

export interface TtsProviderErrorOptions {
  readonly retryable: boolean;
  readonly cause?: unknown;
}

export abstract class TtsProviderError extends CustomError {
  readonly retryable: boolean;

  protected constructor(
    code: TtsProviderErrorCode,
    message: string,
    options: TtsProviderErrorOptions,
  ) {
    super(code, message, { cause: options.cause });
    this.retryable = options.retryable;
  }
}

export class TtsEmptyInputError extends TtsProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.EMPTY_INPUT, "TTS input text is empty.", {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class TtsInvalidVoiceError extends TtsProviderError {
  constructor(voice: string, options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.INVALID_VOICE, `Unsupported TTS voice: ${voice}.`, {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class TtsInvalidSpeedError extends TtsProviderError {
  constructor(speed: number, options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.INVALID_SPEED, `Unsupported TTS speed: ${speed}.`, {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class TtsEmptyAudioError extends TtsProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.EMPTY_AUDIO, "TTS provider returned empty audio.", {
      retryable: true,
      cause: options.cause,
    });
  }
}

export class TtsProviderRateLimitedError extends TtsProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.PROVIDER_RATE_LIMITED, "TTS provider rate limit exceeded.", {
      retryable: true,
      cause: options.cause,
    });
  }
}

export class TtsProviderAuthFailedError extends TtsProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.PROVIDER_AUTH_FAILED, "TTS provider authentication failed.", {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class TtsProviderBadRequestError extends TtsProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.PROVIDER_BAD_REQUEST, "TTS provider rejected the request.", {
      retryable: false,
      cause: options.cause,
    });
  }
}

export class TtsProviderUnavailableError extends TtsProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.PROVIDER_UNAVAILABLE, "TTS provider is unavailable.", {
      retryable: true,
      cause: options.cause,
    });
  }
}

export class TtsProviderFailedError extends TtsProviderError {
  constructor(options: CustomErrorOptions = {}) {
    super(TTS_PROVIDER_ERROR_CODE.PROVIDER_FAILED, "TTS provider failed.", {
      retryable: true,
      cause: options.cause,
    });
  }
}

export function mapToTtsProviderError(cause: unknown): TtsProviderError {
  if (cause instanceof TtsProviderError) {
    return cause;
  }

  const status = getErrorStatus(cause);

  if (status === 429) {
    return new TtsProviderRateLimitedError({ cause });
  }

  if (status === 401 || status === 403) {
    return new TtsProviderAuthFailedError({ cause });
  }

  if (status === 400 || status === 404 || status === 422) {
    return new TtsProviderBadRequestError({ cause });
  }

  if (status && status >= 500) {
    return new TtsProviderUnavailableError({ cause });
  }

  return new TtsProviderFailedError({ cause });
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return null;
  }

  const status = error.status;
  return typeof status === "number" ? status : null;
}
