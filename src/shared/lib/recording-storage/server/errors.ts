import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export const RECORDING_STORAGE_ERROR_CODE = {
  UNSUPPORTED_MIME_TYPE: "RECORDING-001",
  STORAGE_OPERATION_FAILED: "RECORDING-002",
} as const;

export type RecordingStorageErrorCode =
  (typeof RECORDING_STORAGE_ERROR_CODE)[keyof typeof RECORDING_STORAGE_ERROR_CODE];

export abstract class RecordingStorageError extends CustomError {
  protected constructor(
    code: RecordingStorageErrorCode,
    message: string,
    options: CustomErrorOptions = {},
  ) {
    super(code, message, { cause: options.cause });
  }
}

export class UnsupportedRecordingMimeTypeError extends RecordingStorageError {
  constructor(mimeType: string, options: CustomErrorOptions = {}) {
    super(
      RECORDING_STORAGE_ERROR_CODE.UNSUPPORTED_MIME_TYPE,
      `Unsupported recording MIME type: ${mimeType}`,
      { cause: options.cause },
    );
  }
}

export class RecordingStorageOperationError extends RecordingStorageError {
  constructor(operation: string, options: CustomErrorOptions = {}) {
    super(
      RECORDING_STORAGE_ERROR_CODE.STORAGE_OPERATION_FAILED,
      `Recording storage operation failed: ${operation}`,
      { cause: options.cause },
    );
  }
}
