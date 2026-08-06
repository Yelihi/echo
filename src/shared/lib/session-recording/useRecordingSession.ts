"use client";

import { useCallback, useMemo, useReducer, useRef } from "react";

import { AudioCapture, AudioCaptureError, type AudioCaptureOptions } from "@/shared/lib/audio";
import {
  recordingSessionReducer,
  MIN_RECORDING_DURATION_MS,
} from "@/shared/lib/session-recording/recordingSessionReducer";
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
  readonly fail: (message: string) => void;
}

const defaultNow = () => performance.now();

function getRecordingErrorMessage(error: unknown): string {
  return error instanceof AudioCaptureError
    ? error.message
    : "녹음을 처리하지 못했습니다. 다시 시도해주세요.";
}

export function useRecordingSession(
  options: UseRecordingSessionOptions = {},
): UseRecordingSessionResult {
  const now = options.now ?? defaultNow;
  const recorderRef = useRef<AudioCapture | null>(null);
  const [state, dispatch] = useReducer(recordingSessionReducer, { status: "idle" });

  const getRecorder = useCallback(() => {
    recorderRef.current ??= new AudioCapture(options.audioCaptureOptions);
    return recorderRef.current;
  }, [options.audioCaptureOptions]);

  const start = useCallback(async () => {
    try {
      dispatch({ type: "start", startedAtMs: now() });
      await getRecorder().start();
    } catch (error) {
      dispatch({ type: "fail", message: getRecordingErrorMessage(error) });
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
    recorderRef.current?.cancel();
    dispatch({ type: "retry" });
  }, []);

  const retry = useCallback(() => {
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
      fail: (message: string) => dispatch({ type: "fail", message }),
    }),
    [cancel, retry, start, state, stop],
  );
}
