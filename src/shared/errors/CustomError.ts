export interface CustomErrorOptions {
  readonly cause?: unknown;
}

const CUSTOM_ERROR_CODE_PATTERN = /^[A-Z]+-[0-9]{3}$/;
const CUSTOM_ERROR_CODE_FORMAT_MESSAGE = "CustomError code must match the format DOMAIN-001.";

export abstract class CustomError extends Error {
  readonly code: string;
  override readonly cause?: unknown;

  protected constructor(code: string, message: string, options: CustomErrorOptions = {}) {
    if (!CUSTOM_ERROR_CODE_PATTERN.test(code)) {
      throw new Error(CUSTOM_ERROR_CODE_FORMAT_MESSAGE);
    }

    super(message);
    this.name = new.target.name;
    this.code = code;
    this.cause = options.cause;

    // Error 등 내장 클래스를 상속받을 때 프로토타입 체인이 끊어지는 현상(instanceof 실패 등)을
    // 방지하기 위해, 인스턴스의 프로토타입을 실제 생성 시점의 클래스(new.target.prototype)로 복구합니다.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
