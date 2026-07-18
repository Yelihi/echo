import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export abstract class RoleplayTxtImportError extends CustomError {}

export class RoleplayTxtImportUnsupportedFileError extends RoleplayTxtImportError {
  constructor(options: CustomErrorOptions = {}) {
    super("RPI-001", "Only .txt files can be imported.", options);
  }
}

export class RoleplayTxtImportEmptyTextError extends RoleplayTxtImportError {
  constructor(options: CustomErrorOptions = {}) {
    super("RPI-002", "TXT import text cannot be empty.", options);
  }
}

export class RoleplayTxtImportSpeakerCountError extends RoleplayTxtImportError {
  constructor(options: CustomErrorOptions = {}) {
    super("RPI-003", "Roleplay TXT import supports exactly two speakers.", options);
  }
}

export class RoleplayTxtImportInvalidOutputError extends RoleplayTxtImportError {
  constructor(options: CustomErrorOptions = {}) {
    super("RPI-004", "OpenAI returned an invalid roleplay import draft.", options);
  }
}

export class RoleplayTxtImportProviderFailedError extends RoleplayTxtImportError {
  constructor(options: CustomErrorOptions = {}) {
    super("RPI-005", "Roleplay TXT import provider failed.", options);
  }
}
