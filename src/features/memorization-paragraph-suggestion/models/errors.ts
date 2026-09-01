import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export abstract class MemorizationParagraphSuggestionError extends CustomError {
  abstract readonly title: string;
}

export class MemorizationParagraphSuggestionEmptyTextError extends MemorizationParagraphSuggestionError {
  static readonly CODE = "MPS-001";
  readonly title = "본문을 입력해주세요";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationParagraphSuggestionEmptyTextError.CODE,
      "문단 초안을 만들려면 먼저 암기할 본문이 필요합니다.",
      options,
    );
  }
}

export class MemorizationParagraphSuggestionTextTooLongError extends MemorizationParagraphSuggestionError {
  static readonly CODE = "MPS-002";
  readonly title = "본문이 너무 깁니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationParagraphSuggestionTextTooLongError.CODE,
      "본문을 줄인 뒤 다시 문단 제안을 요청해 주세요.",
      options,
    );
  }
}

export class MemorizationParagraphSuggestionInvalidOutputError extends MemorizationParagraphSuggestionError {
  static readonly CODE = "MPS-003";
  readonly title = "문단 제안에 실패했습니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationParagraphSuggestionInvalidOutputError.CODE,
      "문단을 나누지 못했습니다. 잠시 후 다시 시도해 주세요.",
      options,
    );
  }
}

export class MemorizationParagraphSuggestionProviderFailedError extends MemorizationParagraphSuggestionError {
  static readonly CODE = "MPS-004";
  readonly title = "문단 제안에 실패했습니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationParagraphSuggestionProviderFailedError.CODE,
      "잠시 후 다시 시도해 주세요.",
      options,
    );
  }
}

export class MemorizationParagraphSuggestionUnauthorizedError extends MemorizationParagraphSuggestionError {
  static readonly CODE = "MPS-005";
  readonly title = "로그인이 필요합니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationParagraphSuggestionUnauthorizedError.CODE,
      "문단 제안을 받으려면 다시 로그인해 주세요.",
      options,
    );
  }
}

export function createMemorizationParagraphSuggestionErrorFromCode(
  code: string,
): MemorizationParagraphSuggestionError {
  switch (code) {
    case MemorizationParagraphSuggestionEmptyTextError.CODE:
      return new MemorizationParagraphSuggestionEmptyTextError();
    case MemorizationParagraphSuggestionTextTooLongError.CODE:
      return new MemorizationParagraphSuggestionTextTooLongError();
    case MemorizationParagraphSuggestionInvalidOutputError.CODE:
      return new MemorizationParagraphSuggestionInvalidOutputError();
    case MemorizationParagraphSuggestionUnauthorizedError.CODE:
      return new MemorizationParagraphSuggestionUnauthorizedError();
    default:
      return new MemorizationParagraphSuggestionProviderFailedError();
  }
}
