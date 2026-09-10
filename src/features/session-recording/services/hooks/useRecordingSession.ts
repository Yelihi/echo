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
import { recordBrowserOperationEvent } from "@/shared/lib/logging/browser";
import { emitOperationEvent } from "@/shared/lib/logging/emitOperationEvent";
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
  const recordEvent = options.recordEvent ?? recordBrowserOperationEvent;
  const captureId = useRef<string | null>(null);
  const recorderRef = useRef<AudioCapture | null>(null);
  const activeStartTokenRef = useRef<symbol | null>(null);
  const [state, dispatch] = useReducer(recordingSessionReducer, { status: "idle" });

  const beginRecordingStart = useCallback(() => {
    const token = Symbol("recording-start");
    activeStartTokenRef.current = token;
    return token;
  }, []);
  const invalidateRecordingStart = useCallback(() => {
    activeStartTokenRef.current = null;
  }, []);
  const isCurrentRecordingStart = useCallback(
    (token: symbol) => token === activeStartTokenRef.current,
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
    const operationId = crypto.randomUUID();
    captureId.current = operationId;
    const context = { operation: "recording.start", operationId, resourceId: operationId };
    emitOperationEvent(recordEvent, { ...context, phase: "started" });
    const token = beginRecordingStart();
    const recorder = getRecorder();

    try {
      dispatch(startRecording(now()));
      await recorder.start();
      if (!isCurrentRecordingStart(token)) {
        recorder.cancel();
        emitOperationEvent(recordEvent, { ...context, phase: "canceled" });
        return;
      }
      emitOperationEvent(recordEvent, { ...context, phase: "succeeded" });
    } catch (error) {
      if (isCurrentRecordingStart(token)) {
        dispatch(failRecording(getRecordingErrorCode(error)));
        emitOperationEvent(recordEvent, { ...context, phase: "failed" });
      } else {
        emitOperationEvent(recordEvent, { ...context, phase: "canceled" });
      }
    }
  }, [beginRecordingStart, getRecorder, isCurrentRecordingStart, now, recordEvent]);

  const stop = useCallback(async () => {
    const context = {
      operation: "recording.stop",
      operationId: crypto.randomUUID(),
      resourceId: captureId.current ?? "unstarted",
    };
    emitOperationEvent(recordEvent, { ...context, phase: "started" });
    try {
      const audio = await getRecorder().stop();
      dispatch(recordAudio(audio));
      emitOperationEvent(recordEvent, {
        ...context,
        phase: audio.durationMs >= MIN_RECORDING_DURATION_MS ? "succeeded" : "failed",
      });
    } catch (error) {
      dispatch(failRecording(getRecordingErrorCode(error)));
      emitOperationEvent(recordEvent, { ...context, phase: "failed" });
    }
  }, [getRecorder, recordEvent]);

  const reset = useCallback(() => {
    invalidateRecordingStart();
    recorderRef.current?.cancel();
    dispatch(resetRecording());
    if (captureId.current) {
      emitOperationEvent(recordEvent, {
        operation: "recording.reset",
        phase: "succeeded",
        operationId: crypto.randomUUID(),
        resourceId: captureId.current,
      });
      captureId.current = null;
    }
  }, [invalidateRecordingStart, recordEvent]);

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
