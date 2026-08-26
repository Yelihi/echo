"use client";

import { useState, useTransition, type DragEvent } from "react";

// shared
import { errorPopupManager } from "@/shared/lib/error-popup";

// features
import { ROLEPLAY_TXT_IMPORT_EXTENSION_PATTERN } from "@/features/roleplay-txt-import/config/const";
import {
  createRoleplayTxtImportErrorFromCode,
  RoleplayTxtImportError,
  RoleplayTxtImportInvalidFileCountError,
  RoleplayTxtImportProviderFailedError,
  RoleplayTxtImportUnsupportedFileError,
} from "@/features/roleplay-txt-import/models/errors";
import type { RoleplayTxtImportProps } from "@/features/roleplay-txt-import/models/interface";
import type { RoleplayTxtImportDraft } from "@/features/roleplay-txt-import/models/schema";
import { transferTextFile } from "@/features/roleplay-txt-import/services/actions/transferTextFile";

export const useTransferTextFile = (
  onImported: (draft: RoleplayTxtImportDraft) => void,
): RoleplayTxtImportProps => {
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer.files;

    if (files.length === 0 || files.length > 1) {
      openImportError(new RoleplayTxtImportInvalidFileCountError());
      return;
    }

    const file = files[0];

    if (!ROLEPLAY_TXT_IMPORT_EXTENSION_PATTERN.test(file.name)) {
      openImportError(new RoleplayTxtImportUnsupportedFileError());
      return;
    }

    transferFile(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.target.files;
    event.target.value = "";

    if (files === null || files.length === 0 || files.length > 1) {
      openImportError(new RoleplayTxtImportInvalidFileCountError());
      return;
    }

    const file = files[0];

    if (!ROLEPLAY_TXT_IMPORT_EXTENSION_PATTERN.test(file.name)) {
      openImportError(new RoleplayTxtImportUnsupportedFileError());
      return;
    }

    transferFile(file);
  };

  const transferFile = (file: File) => {
    startTransition(async () => {
      try {
        const draft = await transferTextFile(file);

        if (draft.code === "SUCCESS" && draft.data) {
          onImported(draft.data);
          return;
        }

        openImportError(createRoleplayTxtImportErrorFromCode(draft.code));
      } catch {
        openImportError(new RoleplayTxtImportProviderFailedError());
      }
    });
  };

  return {
    isPending,
    isDragging,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  };
};

function openImportError(error: RoleplayTxtImportError) {
  errorPopupManager.open({
    title: error.title,
    message: error.message,
    code: error.code,
  });
}
