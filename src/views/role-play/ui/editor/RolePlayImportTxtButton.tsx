"use client";

import { useRef } from "react";
import { FileUp } from "lucide-react";

// shared
import { DashedActionButton } from "@/shared/components/ui/DashedActionButton";

// features
import type { RoleplayTxtImportProps } from "@/features/roleplay-txt-import/models/interface";

export function RolePlayImportTxtButton({
  isPending,
  isDragging,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
}: RoleplayTxtImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buttonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="text/plain,.txt"
        onChange={handleFileSelect}
        hidden
      />
      <DashedActionButton
        icon={<FileUp className="size-4" />}
        pending={isPending}
        disabled={isPending}
        data-dragging={isDragging || undefined}
        onClick={buttonClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging ? "여기에 TXT 파일을 놓으세요" : "TXT 파일로 불러오기"}
      </DashedActionButton>
    </>
  );
}
