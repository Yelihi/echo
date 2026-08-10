"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { MIN_RECORDING_DURATION_MS } from "@/features/session-recording/config/const";
import {
  failRecording,
  recordAudio,
  resetRecording,
  startRecording,
} from "@/features/session-recording/models/reducer/recording/actions";
import { recordingSessionReducer } from "@/features/session-recording/models/reducer/recording";
import { AudioCapture, AudioCaptureError } from "@/shared/lib/audio";
import type {
  RecordingSessionErrorCode,
  UseRecordingSessionOptions,
  UseRecordingSessionResult,
} from "@/features/session-recording/models/interface";

const defaultNow = () => performance.now();

function getRecordingErrorCode(error: unknown): RecordingSessionErrorCode {
  return error instanceof AudioCaptureError ? error.code : "unknown";
}

export function useRecordingSession(
  options: UseRecordingSessionOptions = {},
): UseRecordingSessionResult {
  const now = options.now ?? defaultNow;
  const recorderRef = useRef<AudioCapture | null>(null);
  const startTokenRef = useRef(0);
  const [state, dispatch] = useReducer(recordingSessionReducer, { status: "idle" });

  const beginRecordingStart = useCallback(() => ++startTokenRef.current, []);
  const invalidateRecordingStart = useCallback(() => {
    startTokenRef.current += 1;
  }, []);
  const isCurrentRecordingStart = useCallback(
    (token: number) => token === startTokenRef.current,
    [],
  );

  const getRecorder = useCallback(() => {
    recorderRef.current ??= new AudioCapture(options.audioCaptureOptions);
    return recorderRef.current;
  }, [options.audioCaptureOptions]);

  useEffect(() => {
    return () => {
      invalidateRecordingStart();
      recorderRef.current?.cancel();
    };
  }, [invalidateRecordingStart]);

  const start = useCallback(async () => {
    const token = beginRecordingStart();
    const recorder = getRecorder();

    try {
      dispatch(startRecording(now()));
      await recorder.start();
      if (!isCurrentRecordingStart(token)) {
        recorder.cancel();
      }
    } catch (error) {
      if (isCurrentRecordingStart(token)) {
        dispatch(failRecording(getRecordingErrorCode(error)));
      }
    }
  }, [beginRecordingStart, getRecorder, isCurrentRecordingStart, now]);

  const stop = useCallback(async () => {
    try {
      const audio = await getRecorder().stop();
      dispatch(recordAudio(audio));
    } catch (error) {
      dispatch(failRecording(getRecordingErrorCode(error)));
    }
  }, [getRecorder]);

  const reset = useCallback(() => {
    invalidateRecordingStart();
    recorderRef.current?.cancel();
    dispatch(resetRecording());
  }, [invalidateRecordingStart]);

  return useMemo(
    () => ({
      state,
      minDurationMs: MIN_RECORDING_DURATION_MS,
      start,
      stop,
      cancel: reset,
      retry: reset,
      fail: (errorCode: RecordingSessionErrorCode) => dispatch(failRecording(errorCode)),
      recordedAudio: state.status === "recorded" ? state.audio : null,
    }),
    [reset, start, state, stop],
  );
}
