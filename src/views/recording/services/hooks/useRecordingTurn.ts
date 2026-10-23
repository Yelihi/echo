"use client";
import type { UseRecordingTurnInput } from "@/views/recording/models/hooks";

import { RecordingRequestError } from "@/features/recording-storage/models/recordingRequestError";
import * as React from "react";

import { useRecordingSession } from "@/features/session-recording";
import { formatRecordingDuration } from "@/shared/lib/recording/formatRecordingDuration";
import type { RecordingPhase } from "@/views/recording/models/interface";
import { showRecordingError } from "@/views/recording/services/showRecordingError";

export function useRecordingTurn({
  store,
  demoDurationMs,
  totalSteps,
  nextPhase,
  saveRecording,
  maxDurationMs,
}: UseRecordingTurnInput) {
  const {
    phase: storedPhase,
    recordingStarted,
    recordingStopped,
    saveStarted,
    saveSucceeded,
    saveFailure,
    retryRecording,
  } = store;
  const recording = useRecordingSession({ maxDurationMs });
  const {
    state: recordingState,
    elapsedMs,
    recordedAudio: audio,
    start,
    stop,
    retry: resetRecording,
  } = recording;
  const operationInProgress = React.useRef(false);
  const recorderFailed =
    recordingState.status === "failed" || recordingState.status === "discarded";
  const phase: RecordingPhase = recorderFailed ? "failed" : storedPhase;
  const timedOut = recordingState.status === "discarded" && recordingState.reason === "timeout";
  const busy = recordingState.status === "starting" || recordingState.status === "stopping";
  const showRemaining = maxDurationMs !== undefined && !audio;
  const remainingMs = Math.max(0, (maxDurationMs ?? 0) - elapsedMs);
  const remainingSeconds = timedOut ? 0 : Math.ceil(remainingMs / 1000);
  const durationLabel = showRemaining
    ? `남은 시간 ${formatRecordingDuration(remainingSeconds * 1000)}`
    : formatRecordingDuration(
        phase === "recording" ? elapsedMs : (audio?.durationMs ?? demoDurationMs),
      );

  const retry = React.useCallback(() => {
    if (operationInProgress.current) return;
    resetRecording();
    retryRecording();
  }, [resetRecording, retryRecording]);

  const toggle = React.useCallback(async () => {
    if (operationInProgress.current) return;
    if (phase === "recorded" || phase === "completed") return;
    operationInProgress.current = true;
    try {
      if (phase === "recording") {
        if ((await stop()) === "recorded") recordingStopped();
        return;
      }
      if (phase !== "user-ready" && phase !== "failed") return;

      if (phase === "failed") resetRecording();
      if ((await start()) === "started") recordingStarted();
    } finally {
      operationInProgress.current = false;
    }
  }, [phase, recordingStarted, recordingStopped, resetRecording, start, stop]);

  const save = React.useCallback(async () => {
    if (!audio || operationInProgress.current) return;
    operationInProgress.current = true;
    try {
      saveStarted();
      if (!saveRecording) throw new RecordingRequestError("RECORDING_SERVER_NOT_READY");
      await saveRecording(audio);
      resetRecording();
      saveSucceeded(totalSteps, nextPhase);
    } catch (error) {
      saveFailure();
      showRecordingError(error);
    } finally {
      operationInProgress.current = false;
    }
  }, [
    audio,
    nextPhase,
    resetRecording,
    saveFailure,
    saveRecording,
    saveStarted,
    saveSucceeded,
    totalSteps,
  ]);

  return {
    phase,
    durationLabel,
    recordingState,
    recordedAudio: audio,
    busy,
    timedOut,
    retry,
    toggle,
    save,
  };
}
