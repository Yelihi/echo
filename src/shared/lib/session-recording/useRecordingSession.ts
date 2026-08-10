"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { AudioCapture, AudioCaptureError, type AudioCaptureOptions } from "@/shared/lib/audio";
import {
  recordingSessionReducer,
  MIN_RECORDING_DURATION_MS,
} from "@/shared/lib/session-recording/recordingSessionReducer";
import type { CapturedAudio } from "@/shared/lib/audio";
import type { RecordingSessionState } from "@/shared/lib/session-recording/types";

interface UseRecordingSessionOptions {
  readonly audioCaptureOptions?: AudioCaptureOptions;
  readonly now?: () => number;
}

interface UseRecordingSessionResult {
  readonly state: RecordingSessionState;
  readonly minDurationMs: number;
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
  readonly cancel: () => void;
  readonly retry: () => void;
  readonly markSaving: () => void;
  readonly markSaved: () => void;
  readonly fail: (message: string, audio?: CapturedAudio) => void;
}

const defaultNow = () => performance.now();
const RECORDING_ERROR_MESSAGES: Record<AudioCaptureError["code"], string> = {
  "permission-denied": "마이크 권한을 허용한 뒤 다시 시도해주세요.",
  "device-not-found": "사용 가능한 마이크를 찾지 못했습니다.",
  "unsupported-format": "이 브라우저에서는 지원되는 녹음 형식이 없습니다.",
  "recorder-unavailable": "현재 환경에서는 녹음을 사용할 수 없습니다.",
  "recorder-start-failed": "녹음을 시작하지 못했습니다. 다시 시도해주세요.",
  "recorder-stop-failed": "녹음을 종료하지 못했습니다. 다시 시도해주세요.",
  "empty-audio-data": "녹음된 음성이 없습니다. 다시 녹음해주세요.",
};

function getRecordingErrorMessage(error: unknown): string {
  return error instanceof AudioCaptureError
    ? RECORDING_ERROR_MESSAGES[error.code]
    : "녹음을 처리하지 못했습니다. 다시 시도해주세요.";
}

export function useRecordingSession(
  options: UseRecordingSessionOptions = {},
): UseRecordingSessionResult {
  const now = options.now ?? defaultNow;
  const recorderRef = useRef<AudioCapture | null>(null);
  const startVersionRef = useRef(0);
  const [state, dispatch] = useReducer(recordingSessionReducer, { status: "idle" });

  const getRecorder = useCallback(() => {
    recorderRef.current ??= new AudioCapture(options.audioCaptureOptions);
    return recorderRef.current;
  }, [options.audioCaptureOptions]);

  useEffect(() => {
    return () => {
      startVersionRef.current += 1;
      recorderRef.current?.cancel();
    };
  }, []);

  const start = useCallback(async () => {
    const startVersion = ++startVersionRef.current;
    const recorder = getRecorder();

    try {
      dispatch({ type: "start", startedAtMs: now() });
      await recorder.start();
      if (startVersion !== startVersionRef.current) {
        recorder.cancel();
      }
    } catch (error) {
      if (startVersion === startVersionRef.current) {
        dispatch({ type: "fail", message: getRecordingErrorMessage(error) });
      }
    }
  }, [getRecorder, now]);

  const stop = useCallback(async () => {
    try {
      const audio = await getRecorder().stop();
      dispatch({ type: "record", audio });
    } catch (error) {
      dispatch({ type: "fail", message: getRecordingErrorMessage(error) });
    }
  }, [getRecorder]);

  const cancel = useCallback(() => {
    startVersionRef.current += 1;
    recorderRef.current?.cancel();
    dispatch({ type: "retry" });
  }, []);

  const retry = useCallback(() => {
    startVersionRef.current += 1;
    recorderRef.current?.cancel();
    dispatch({ type: "retry" });
  }, []);

  return useMemo(
    () => ({
      state,
      minDurationMs: MIN_RECORDING_DURATION_MS,
      start,
      stop,
      cancel,
      retry,
      markSaving: () => dispatch({ type: "save" }),
      markSaved: () => dispatch({ type: "saved" }),
      fail: (message: string, audio?: CapturedAudio) => dispatch({ type: "fail", message, audio }),
    }),
    [cancel, retry, start, state, stop],
  );
}
