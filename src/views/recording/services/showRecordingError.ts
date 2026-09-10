import { errorPopupManager } from "@/shared/lib/error-popup";
import { RecordingRequestError } from "@/features/recording-storage/models/recordingRequestError";

export function showRecordingError(error: unknown): void {
  const failure =
    error instanceof RecordingRequestError
      ? error
      : new RecordingRequestError("RECORDING_SAVE_FAILED");
  errorPopupManager.open({
    title: "녹음을 저장하지 못했습니다",
    message: failure.message,
    code: failure.code,
  });
}
