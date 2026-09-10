export const recordingErrorMessages = {
  RECORDING_SERVER_NOT_READY:
    "녹음 저장 서버가 아직 준비되지 않았습니다. 녹음은 현재 화면에 남아 있습니다. 관리자에게 문의해주세요.",
  RECORDING_CONFLICT:
    "세션 상태가 변경되어 저장하지 못했습니다. 다른 창에서 진행 중인지 확인해주세요.",
  RECORDING_SAVE_FAILED:
    "녹음을 저장하지 못했습니다. 녹음은 현재 화면에 남아 있으니 잠시 후 다시 시도해주세요.",
} as const;

export type RecordingRequestErrorCode = keyof typeof recordingErrorMessages;

export class RecordingRequestError extends Error {
  constructor(readonly code: RecordingRequestErrorCode) {
    super(recordingErrorMessages[code]);
    this.name = "RecordingRequestError";
  }
}

export async function assertRecordingResponse(response: Response): Promise<void> {
  if (response.ok) return;
  const body: unknown = await response.json().catch(() => null);
  const code = body && typeof body === "object" && "code" in body ? body.code : null;
  throw new RecordingRequestError(
    code === "RECORDING_SERVER_NOT_READY" || code === "RECORDING_CONFLICT"
      ? code
      : "RECORDING_SAVE_FAILED",
  );
}

export interface RecordingRpcFailure {
  code: string;
  message: string;
}
export interface RecordingFailureResponse {
  status: number;
  code: RecordingRequestErrorCode;
}
