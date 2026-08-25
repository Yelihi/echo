// shared
import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export abstract class RolePlayMaterialCreateError extends CustomError {
  abstract readonly title: string;
}

export class RolePlayMaterialUnauthorizedError extends RolePlayMaterialCreateError {
  static readonly CODE = "RPM-001";
  readonly title = "로그인이 필요합니다";

  constructor(options: CustomErrorOptions = {}) {
    super(
      RolePlayMaterialUnauthorizedError.CODE,
      "롤플레잉 자료를 저장하려면 다시 로그인해 주세요.",
      options,
    );
  }
}

export class RolePlayMaterialInvalidError extends RolePlayMaterialCreateError {
  static readonly CODE = "RPM-002";
  readonly title = "입력 내용을 확인해주세요";

  constructor(options: CustomErrorOptions = {}) {
    super(
      RolePlayMaterialInvalidError.CODE,
      "제목, 상황 설명, 대사를 다시 확인한 뒤 저장해 주세요.",
      options,
    );
  }
}

export class RolePlayMaterialSaveFailedError extends RolePlayMaterialCreateError {
  static readonly CODE = "RPM-003";
  readonly title = "저장에 실패했습니다";

  constructor(options: CustomErrorOptions = {}) {
    super(RolePlayMaterialSaveFailedError.CODE, "잠시 후 다시 시도해 주세요.", options);
  }
}

export function createRolePlayMaterialErrorFromCode(code: string): RolePlayMaterialCreateError {
  switch (code) {
    case RolePlayMaterialUnauthorizedError.CODE:
      return new RolePlayMaterialUnauthorizedError();
    case RolePlayMaterialInvalidError.CODE:
      return new RolePlayMaterialInvalidError();
    case RolePlayMaterialSaveFailedError.CODE:
      return new RolePlayMaterialSaveFailedError();
    default:
      return new RolePlayMaterialSaveFailedError();
  }
}
