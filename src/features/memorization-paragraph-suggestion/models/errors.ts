import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export abstract class MemorizationParagraphSuggestionError extends CustomError {}

export class MemorizationParagraphSuggestionEmptyTextError extends MemorizationParagraphSuggestionError {
  constructor(options: CustomErrorOptions = {}) {
    super("MPS-001", "Memorization paragraph suggestion text cannot be empty.", options);
  }
}

export class MemorizationParagraphSuggestionTextTooLongError extends MemorizationParagraphSuggestionError {
  constructor(options: CustomErrorOptions = {}) {
    super("MPS-002", "Memorization paragraph suggestion text is too long.", options);
  }
}

export class MemorizationParagraphSuggestionInvalidOutputError extends MemorizationParagraphSuggestionError {
  constructor(options: CustomErrorOptions = {}) {
    super("MPS-003", "OpenAI returned an invalid paragraph suggestion.", options);
  }
}

export class MemorizationParagraphSuggestionProviderFailedError extends MemorizationParagraphSuggestionError {
  constructor(options: CustomErrorOptions = {}) {
    super("MPS-004", "Memorization paragraph suggestion provider failed.", options);
  }
}
