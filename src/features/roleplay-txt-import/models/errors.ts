import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export abstract class RoleplayTxtImportError extends CustomError {
  abstract readonly title: string;
}

export class RoleplayTxtImportUnsupportedFileError extends RoleplayTxtImportError {
  static readonly CODE = "RPI-001";
  readonly title = "파일 형식을 확인해주세요";

  constructor(options: CustomErrorOptions = {}) {
    super(RoleplayTxtImportUnsupportedFileError.CODE, "TXT 파일만 불러올 수 있습니다.", options);
  }
}

export class RoleplayTxtImportEmptyTextError extends RoleplayTxtImportError {
  static readonly CODE = "RPI-002";
  readonly title = "파일을 확인해주세요";

  constructor(options: CustomErrorOptions = {}) {
    super(
      RoleplayTxtImportEmptyTextError.CODE,
      "내용이 비어 있는 파일은 불러올 수 없습니다.",
      options,
    );
  }
}

export class RoleplayTxtImportSpeakerCountError extends RoleplayTxtImportError {
  static readonly CODE = "RPI-003";
  readonly title = "불러올 수 없는 대본입니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      RoleplayTxtImportSpeakerCountError.CODE,
      "두 명이 주고받는 대화 형식의 TXT만 불러올 수 있습니다.",
      options,
    );
  }
}

export class RoleplayTxtImportInvalidOutputError extends RoleplayTxtImportError {
  static readonly CODE = "RPI-004";
  readonly title = "불러오기에 실패했습니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      RoleplayTxtImportInvalidOutputError.CODE,
      "대본을 변환하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      options,
    );
  }
}

export class RoleplayTxtImportProviderFailedError extends RoleplayTxtImportError {
  static readonly CODE = "RPI-005";
  readonly title = "불러오기에 실패했습니다";

  constructor(options: CustomErrorOptions = {}) {
    super(RoleplayTxtImportProviderFailedError.CODE, "잠시 후 다시 시도해 주세요.", options);
  }
}

export class RoleplayTxtImportInvalidFileCountError extends RoleplayTxtImportError {
  static readonly CODE = "RPI-006";
  readonly title = "파일을 하나만 선택해주세요";

  constructor(options: CustomErrorOptions = {}) {
    super(
      RoleplayTxtImportInvalidFileCountError.CODE,
      "한 번에 하나의 TXT 파일만 불러올 수 있습니다.",
      options,
    );
  }
}

export function createRoleplayTxtImportErrorFromCode(code: string): RoleplayTxtImportError {
  switch (code) {
    case RoleplayTxtImportUnsupportedFileError.CODE:
      return new RoleplayTxtImportUnsupportedFileError();
    case RoleplayTxtImportEmptyTextError.CODE:
      return new RoleplayTxtImportEmptyTextError();
    case RoleplayTxtImportSpeakerCountError.CODE:
      return new RoleplayTxtImportSpeakerCountError();
    case RoleplayTxtImportInvalidOutputError.CODE:
      return new RoleplayTxtImportInvalidOutputError();
    case RoleplayTxtImportInvalidFileCountError.CODE:
      return new RoleplayTxtImportInvalidFileCountError();
    default:
      return new RoleplayTxtImportProviderFailedError();
  }
}
