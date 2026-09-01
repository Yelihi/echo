import { describe, expect, it } from "@jest/globals";

// views
import {
  createMemorizationMaterialErrorFromCode,
  MemorizationMaterialInvalidError,
  MemorizationMaterialSaveFailedError,
  MemorizationMaterialUnauthorizedError,
} from "@/views/memorization/models/errors";

describe("createMemorizationMaterialErrorFromCode", () => {
  it("maps MEM-001 to an unauthorized error", () => {
    const error = createMemorizationMaterialErrorFromCode(
      MemorizationMaterialUnauthorizedError.CODE,
    );

    expect(error).toBeInstanceOf(MemorizationMaterialUnauthorizedError);
    expect(error.code).toBe("MEM-001");
    expect(error.title).toBe("로그인이 필요합니다");
  });

  it("maps MEM-002 to an invalid material error", () => {
    const error = createMemorizationMaterialErrorFromCode(MemorizationMaterialInvalidError.CODE);

    expect(error).toBeInstanceOf(MemorizationMaterialInvalidError);
    expect(error.code).toBe("MEM-002");
  });

  it("falls back to save-failed for an unknown code", () => {
    const error = createMemorizationMaterialErrorFromCode("UNKNOWN");

    expect(error).toBeInstanceOf(MemorizationMaterialSaveFailedError);
    expect(error.code).toBe("MEM-003");
  });
});
