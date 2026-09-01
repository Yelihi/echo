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
