import type {
  RecordingSessionErrorCode,
  RecordingSessionState,
} from "@/features/session-recording";
import type { RecordingPhase } from "@/views/recording/models/interface";

const RECORDING_ERROR_MESSAGES: Record<RecordingSessionErrorCode, string> = {
  "permission-denied": "마이크 권한을 허용한 뒤 다시 시도해주세요.",
  "device-not-found": "사용 가능한 마이크를 찾지 못했습니다.",
  "unsupported-format": "이 브라우저에서는 지원되는 녹음 형식이 없습니다.",
  "recorder-unavailable": "현재 환경에서는 녹음을 사용할 수 없습니다.",
  "recorder-start-failed": "녹음을 시작하지 못했습니다. 다시 시도해주세요.",
  "recorder-stop-failed": "녹음을 종료하지 못했습니다. 다시 시도해주세요.",
  "empty-audio-data": "녹음된 음성이 없습니다. 다시 녹음해주세요.",
  unknown: "녹음을 처리하지 못했습니다. 다시 시도해 주세요",
};

export function getRecordingSessionHint(
  phase: RecordingPhase,
  recordingState: RecordingSessionState,
  saveFailed: boolean,
): string {
  if (saveFailed) return "저장하지 못했습니다. 다시 시도해주세요.";
  if (recordingState.status === "discarded") return "녹음이 너무 짧습니다. 다시 녹음해 주세요";
  if (recordingState.status === "failed") return RECORDING_ERROR_MESSAGES[recordingState.errorCode];

  switch (phase) {
    case "partner-speaking":
      return "상대방 문장이 끝나면 녹음할 수 있어요";
    case "user-ready":
      return "버튼을 눌러 내 문장을 녹음해 주세요";
    case "recording":
      return "말이 끝나면 버튼을 다시 눌러 주세요";
    case "recorded":
      return "저장하거나 다시 녹음할 수 있어요";
    case "failed":
      return "다시 녹음해 주세요";
    case "ready":
      return "";
  }
}
