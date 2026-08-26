"use server";

import { parseRoleplayTxtImport } from "@/features/roleplay-txt-import/services/server/parseRoleplayTxtImport";
import { RoleplayTxtImportError } from "@/features/roleplay-txt-import/models/errors";

export const transferTextFile = async (file: File) => {
  try {
    const draft = await parseRoleplayTxtImport({ file });
    return { code: "SUCCESS", data: draft };
  } catch (error) {
    if (error instanceof RoleplayTxtImportError) {
      return { code: error.code, message: error.message };
    }

    throw error;
  }
};
