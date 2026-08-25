import { describe, expect, it } from "@jest/globals";

// views
import {
  createRolePlayMaterialErrorFromCode,
  RolePlayMaterialInvalidError,
  RolePlayMaterialSaveFailedError,
  RolePlayMaterialUnauthorizedError,
} from "@/views/role-play/models/errors";

describe("createRolePlayMaterialErrorFromCode", () => {
  it("maps RPM-001 to an unauthorized error", () => {
    const error = createRolePlayMaterialErrorFromCode(RolePlayMaterialUnauthorizedError.CODE);

    expect(error).toBeInstanceOf(RolePlayMaterialUnauthorizedError);
    expect(error.code).toBe("RPM-001");
    expect(error.title).toBe("로그인이 필요합니다");
  });

  it("maps RPM-002 to an invalid material error", () => {
    const error = createRolePlayMaterialErrorFromCode(RolePlayMaterialInvalidError.CODE);

    expect(error).toBeInstanceOf(RolePlayMaterialInvalidError);
    expect(error.code).toBe("RPM-002");
  });

  it("falls back to save-failed for an unknown code", () => {
    const error = createRolePlayMaterialErrorFromCode("UNKNOWN");

    expect(error).toBeInstanceOf(RolePlayMaterialSaveFailedError);
    expect(error.code).toBe("RPM-003");
  });
});
