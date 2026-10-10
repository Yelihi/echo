"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

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

function getRecordingErrorCode(error: unknown): RecordingSessionErrorCode {
  return error instanceof AudioCaptureError ? error.code : "unknown";
}

export function useRecordingSession(
  options: UseRecordingSessionOptions = {},
): UseRecordingSessionResult {
  const recordEvent = options.recordEvent ?? recordBrowserOperationEvent;
  const captureId = useRef<string | null>(null);
  const recorderRef = useRef<AudioCapture | null>(null);
  const activeAttempt = useRef<symbol | null>(null);
  const [state, dispatch] = useReducer(recordingSessionReducer, { status: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const maxDurationMs = options.maxDurationMs;

  const cancelCapture = useCallback(() => {
    activeAttempt.current = null;
    recorderRef.current?.cancel();
  }, []);

  useEffect(() => cancelCapture, [cancelCapture]);

  const expire = useCallback(() => {
    const recorder = recorderRef.current;
    if (!activeAttempt.current || recorder?.getStatus() !== "recording") return false;
    const elapsed = recorder.getElapsedMs();
    setElapsedMs(elapsed);
    if (maxDurationMs === undefined || elapsed < maxDurationMs) return false;
    cancelCapture();
    dispatch({ type: "timeout" });
    emitOperationEvent(recordEvent, {
      operation: "recording.timeout",
      phase: "canceled",
      operationId: crypto.randomUUID(),
      resourceId: captureId.current ?? "unstarted",
    });
    return true;
  }, [cancelCapture, maxDurationMs, recordEvent]);

  useEffect(() => {
    if (state.status !== "recording") return;
    const timer = window.setInterval(expire, 250);
    const deadline =
      maxDurationMs === undefined
        ? undefined
        : window.setTimeout(
            expire,
            Math.max(0, maxDurationMs - (recorderRef.current?.getElapsedMs() ?? 0)),
          );
    document.addEventListener("visibilitychange", expire);
    window.addEventListener("pageshow", expire);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(deadline);
      document.removeEventListener("visibilitychange", expire);
      window.removeEventListener("pageshow", expire);
    };
  }, [expire, maxDurationMs, state.status]);

  const start = useCallback(async () => {
    if (activeAttempt.current) return "canceled" as const;
    const token = Symbol("recording-attempt");
    activeAttempt.current = token;
    const operationId = crypto.randomUUID();
    captureId.current = operationId;
    const context = { operation: "recording.start", operationId, resourceId: operationId };
    emitOperationEvent(recordEvent, { ...context, phase: "started" });
    const recorder = new AudioCapture({
      ...options.audioCaptureOptions,
      ...(options.now ? { clock: { now: options.now } } : {}),
    });
    recorderRef.current = recorder;
    setElapsedMs(0);
    dispatch({ type: "preparing" });
    try {
      const startedAtMs = await recorder.start();
      if (activeAttempt.current !== token || startedAtMs === null) {
        emitOperationEvent(recordEvent, { ...context, phase: "canceled" });
        return "canceled" as const;
      }
      dispatch(startRecording(startedAtMs));
      emitOperationEvent(recordEvent, { ...context, phase: "succeeded" });
      return "started" as const;
    } catch (error) {
      if (activeAttempt.current !== token) {
        emitOperationEvent(recordEvent, { ...context, phase: "canceled" });
        return "canceled" as const;
      }
      activeAttempt.current = null;
      dispatch(failRecording(getRecordingErrorCode(error)));
      emitOperationEvent(recordEvent, { ...context, phase: "failed" });
      return "failed" as const;
    }
  }, [options.audioCaptureOptions, options.now, recordEvent]);

  const stop = useCallback(async () => {
    const token = activeAttempt.current;
    const recorder = recorderRef.current;
    if (!token || recorder?.getStatus() !== "recording") return "canceled" as const;
    if (expire()) return "discarded" as const;
    // stop() synchronously freezes capture duration before awaiting the final chunk.
    const pendingAudio = recorder.stop(maxDurationMs);
    dispatch({ type: "stopping" });
    const context = {
      operation: "recording.stop",
      operationId: crypto.randomUUID(),
      resourceId: captureId.current ?? "unstarted",
    };
    emitOperationEvent(recordEvent, { ...context, phase: "started" });
    try {
      const audio = await pendingAudio;
      if (activeAttempt.current !== token) {
        emitOperationEvent(recordEvent, { ...context, phase: "canceled" });
        return "canceled" as const;
      }
      activeAttempt.current = null;
      const tooShort = audio.durationMs < MIN_RECORDING_DURATION_MS;
      dispatch(recordAudio(audio));
      emitOperationEvent(recordEvent, { ...context, phase: tooShort ? "failed" : "succeeded" });
      return tooShort ? ("discarded" as const) : ("recorded" as const);
    } catch (error) {
      if (activeAttempt.current !== token) {
        emitOperationEvent(recordEvent, { ...context, phase: "canceled" });
        return "canceled" as const;
      }
      activeAttempt.current = null;
      if (error instanceof AudioCaptureError && error.code === "duration-limit-exceeded") {
        dispatch({ type: "timeout" });
        emitOperationEvent(recordEvent, { ...context, phase: "canceled" });
        return "discarded" as const;
      }
      dispatch(failRecording(getRecordingErrorCode(error)));
      emitOperationEvent(recordEvent, { ...context, phase: "failed" });
      return "failed" as const;
    }
  }, [expire, maxDurationMs, recordEvent]);

  const reset = useCallback(() => {
    cancelCapture();
    setElapsedMs(0);
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
  }, [cancelCapture, recordEvent]);

  return useMemo(
    () => ({
      state,
      elapsedMs,
      minDurationMs: MIN_RECORDING_DURATION_MS,
      start,
      stop,
      cancel: reset,
      retry: reset,
      fail: (errorCode: RecordingSessionErrorCode) => {
        cancelCapture();
        dispatch(failRecording(errorCode));
      },
      recordedAudio: state.status === "recorded" ? state.audio : null,
    }),
    [cancelCapture, elapsedMs, reset, start, state, stop],
  );
}
