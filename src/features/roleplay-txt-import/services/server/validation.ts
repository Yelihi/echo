import { ROLEPLAY_TXT_IMPORT_EXTENSION_PATTERN } from "@/features/roleplay-txt-import/config/const";
import {
  RoleplayTxtImportEmptyTextError,
  RoleplayTxtImportUnsupportedFileError,
} from "@/features/roleplay-txt-import/models/errors";

export async function readRoleplayTxtImportText(file: File): Promise<string> {
  assertRoleplayTxtImportFile(file);

  const text = (await file.text()).trim();

  if (!text) {
    throw new RoleplayTxtImportEmptyTextError();
  }

  return text;
}

function assertRoleplayTxtImportFile(file: File): void {
  if (!ROLEPLAY_TXT_IMPORT_EXTENSION_PATTERN.test(file.name)) {
    throw new RoleplayTxtImportUnsupportedFileError();
  }
}
