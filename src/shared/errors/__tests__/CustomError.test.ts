import { describe, expect, it } from "@jest/globals";

import { CustomError } from "../CustomError";
import type { CustomErrorOptions } from "../CustomError";

class TestCustomError extends CustomError {
  constructor(code: string, message: string, options?: CustomErrorOptions) {
    super(code, message, options);
  }
}

describe("CustomError", () => {
  it("keeps a stable code, message, and cause for downstream logging", () => {
    const cause = new Error("database unavailable");
    const error = new TestCustomError("AUTH-001", "Logout failed.", { cause });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CustomError);
    expect(error.name).toBe("TestCustomError");
    expect(error.code).toBe("AUTH-001");
    expect(error.message).toBe("Logout failed.");
    expect(error.cause).toBe(cause);
  });

  it("rejects codes that do not follow the global error code format", () => {
    expect(() => new TestCustomError("auth-001", "Invalid code.")).toThrow(
      "CustomError code must match the format DOMAIN-001.",
    );
  });
});
