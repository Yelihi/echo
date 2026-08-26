import type { ChangeEvent, DragEvent } from "react";

export interface RoleplayTxtImportOpenAIClient {
  readonly responses: {
    parse(body: unknown): Promise<{ readonly output_parsed: unknown }>;
  };
}

export interface RequestRoleplayTxtImportInput {
  readonly client: RoleplayTxtImportOpenAIClient;
  readonly model: string;
  readonly text: string;
}

export interface ParseRoleplayTxtImportInput {
  readonly file: File;
  readonly client?: RoleplayTxtImportOpenAIClient;
  readonly model?: string;
}

export interface RoleplayTxtImportProps {
  readonly isPending: boolean;
  readonly isDragging: boolean;
  readonly handleDragEnter: (event: DragEvent<HTMLButtonElement>) => void;
  readonly handleDragOver: (event: DragEvent<HTMLButtonElement>) => void;
  readonly handleDragLeave: (event: DragEvent<HTMLButtonElement>) => void;
  readonly handleDrop: (event: DragEvent<HTMLButtonElement>) => void;
  readonly handleFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
}
