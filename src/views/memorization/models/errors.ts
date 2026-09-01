// shared
import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export abstract class MemorizationMaterialCreateError extends CustomError {
  abstract readonly title: string;
}

export class MemorizationMaterialUnauthorizedError extends MemorizationMaterialCreateError {
  static readonly CODE = "MEM-001";
  readonly title = "로그인이 필요합니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationMaterialUnauthorizedError.CODE,
      "문장 암기 자료를 저장하려면 다시 로그인해 주세요.",
      options,
    );
  }
}

export class MemorizationMaterialInvalidError extends MemorizationMaterialCreateError {
  static readonly CODE = "MEM-002";
  readonly title = "입력 내용을 확인해주세요";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationMaterialInvalidError.CODE,
      "제목과 확정된 문단을 다시 확인한 뒤 저장해 주세요.",
      options,
    );
  }
}

export class MemorizationMaterialSaveFailedError extends MemorizationMaterialCreateError {
  static readonly CODE = "MEM-003";
  readonly title = "저장에 실패했습니다";

  constructor(options: CustomErrorOptions = {}) {
    super(MemorizationMaterialSaveFailedError.CODE, "잠시 후 다시 시도해 주세요.", options);
  }
}

export function createMemorizationMaterialErrorFromCode(
  code: string,
): MemorizationMaterialCreateError {
  switch (code) {
    case MemorizationMaterialUnauthorizedError.CODE:
      return new MemorizationMaterialUnauthorizedError();
    case MemorizationMaterialInvalidError.CODE:
      return new MemorizationMaterialInvalidError();
    case MemorizationMaterialSaveFailedError.CODE:
      return new MemorizationMaterialSaveFailedError();
    default:
      return new MemorizationMaterialSaveFailedError();
  }
}

export abstract class MemorizationSessionCreateError extends CustomError {
  abstract readonly title: string;
}

export class MemorizationSessionCreateUnauthorizedError extends MemorizationSessionCreateError {
  static readonly CODE = "MMS-001";
  readonly title = "로그인이 필요합니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationSessionCreateUnauthorizedError.CODE,
      "세션을 생성하려면 다시 로그인해 주세요.",
      options,
    );
  }
}

export class MemorizationSessionCreateSourceMaterialNotFoundError extends MemorizationSessionCreateError {
  static readonly CODE = "MMS-002";
  readonly title = "존재하지 않는 자료입니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      MemorizationSessionCreateSourceMaterialNotFoundError.CODE,
      "존재하지 않는 자료입니다.",
      options,
    );
  }
}

export class MemorizationSessionCreateFailedError extends MemorizationSessionCreateError {
  static readonly CODE = "MMS-003";
  readonly title = "세션 생성에 실패했습니다";

  constructor(options: CustomErrorOptions = {}) {
    super(MemorizationSessionCreateFailedError.CODE, "잠시 후 다시 시도해 주세요.", options);
  }
}

export function createMemorizationSessionErrorFromCode(
  code: string,
): MemorizationSessionCreateError {
  switch (code) {
    case MemorizationSessionCreateUnauthorizedError.CODE:
      return new MemorizationSessionCreateUnauthorizedError();
    case MemorizationSessionCreateSourceMaterialNotFoundError.CODE:
      return new MemorizationSessionCreateSourceMaterialNotFoundError();
    case MemorizationSessionCreateFailedError.CODE:
      return new MemorizationSessionCreateFailedError();
    default:
      return new MemorizationSessionCreateFailedError();
  }
}
