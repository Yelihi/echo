import { describe, expect, it } from "@jest/globals";

import {
  createRoleplayTxtImportErrorFromCode,
  RoleplayTxtImportProviderFailedError,
  RoleplayTxtImportSpeakerCountError,
  RoleplayTxtImportUnauthorizedError,
  RoleplayTxtImportUnsupportedFileError,
} from "@/features/roleplay-txt-import/models/errors";

describe("createRoleplayTxtImportErrorFromCode", () => {
  it("should map RPI-001 to an unsupported file error", () => {
    // Given / When
    const error = createRoleplayTxtImportErrorFromCode(RoleplayTxtImportUnsupportedFileError.CODE);

    // Then
    expect(error).toBeInstanceOf(RoleplayTxtImportUnsupportedFileError);
    expect(error.code).toBe("RPI-001");
    expect(error.title).toBe("파일 형식을 확인해주세요");
  });

  it("should map RPI-003 to a speaker count error", () => {
    // Given / When
    const error = createRoleplayTxtImportErrorFromCode(RoleplayTxtImportSpeakerCountError.CODE);

    // Then
    expect(error).toBeInstanceOf(RoleplayTxtImportSpeakerCountError);
    expect(error.code).toBe("RPI-003");
    expect(error.title).toBe("불러올 수 없는 대본입니다");
  });

  it("should map RPI-007 to an unauthorized error", () => {
    // Given / When
    const error = createRoleplayTxtImportErrorFromCode(RoleplayTxtImportUnauthorizedError.CODE);

    // Then
    expect(error).toBeInstanceOf(RoleplayTxtImportUnauthorizedError);
    expect(error.code).toBe("RPI-007");
    expect(error.title).toBe("로그인이 필요합니다");
  });

  it("should fall back to a provider error for an unknown code", () => {
    // Given / When
    const error = createRoleplayTxtImportErrorFromCode("UNKNOWN");

    // Then
    expect(error).toBeInstanceOf(RoleplayTxtImportProviderFailedError);
    expect(error.code).toBe("RPI-005");
  });
});
