"use server";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// features
import {
  RoleplayTxtImportError,
  RoleplayTxtImportUnauthorizedError,
} from "@/features/roleplay-txt-import/models/errors";
import { parseRoleplayTxtImport } from "@/features/roleplay-txt-import/services/server/parseRoleplayTxtImport";

export const transferTextFile = async (file: File) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: RoleplayTxtImportUnauthorizedError.CODE };
  }

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
