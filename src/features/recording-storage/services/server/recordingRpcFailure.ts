import type {
  RecordingRpcFailure,
  RecordingFailureResponse,
} from "@/features/recording-storage/models/recordingRequestError";

export function classifyRecordingRpcFailure(error: RecordingRpcFailure): RecordingFailureResponse {
  if (error.code === "PGRST202" || error.code === "42883") {
    return { status: 503, code: "RECORDING_SERVER_NOT_READY" };
  }
  if (
    error.code === "23505" ||
    (error.code === "P0001" &&
      [
        "Session unavailable",
        "Recording request conflict",
        "Session already completed",
        "Unexpected recording target",
        "Recordings incomplete",
        "Completed recording is immutable",
      ].includes(error.message))
  ) {
    return { status: 409, code: "RECORDING_CONFLICT" };
  }
  return { status: 500, code: "RECORDING_SAVE_FAILED" };
}

export function recordingRpcFailureResponse(error: RecordingRpcFailure): Response {
  const { code, status } = classifyRecordingRpcFailure(error);
  return Response.json({ code }, { status });
}
