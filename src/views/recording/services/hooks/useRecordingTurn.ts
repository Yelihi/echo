"use client";
import type { UseRecordingTurnInput } from "@/views/recording/models/hooks";

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
}: UseRecordingTurnInput) {
  const {
    phase: storedPhase,
    elapsedMs,
    recordingStarted,
    recordingStopped,
    saveStarted,
    saveSucceeded,
    saveFailure,
    retryRecording,
    setElapsedMs,
  } = store;
  const recording = useRecordingSession();
  const {
    state: recordingState,
    recordedAudio: audio,
    start,
    stop,
    retry: resetRecording,
  } = recording;
  const startedAtRef = React.useRef<number | null>(null);
  const operationInProgress = React.useRef(false);
  const recorderFailed =
    recordingState.status === "failed" || recordingState.status === "discarded";
  const phase: RecordingPhase = recorderFailed ? "failed" : storedPhase;
  const durationLabel = formatRecordingDuration(
    phase === "recording" ? elapsedMs : (audio?.durationMs ?? demoDurationMs),
  );

  React.useEffect(() => {
    if (phase !== "recording") return;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - (startedAtRef.current ?? Date.now()));
    }, 250);
    return () => window.clearInterval(id);
  }, [phase, setElapsedMs]);

  const retry = React.useCallback(() => {
    if (operationInProgress.current) return;
    resetRecording();
    startedAtRef.current = null;
    retryRecording();
  }, [resetRecording, retryRecording]);

  const toggle = React.useCallback(async () => {
    if (operationInProgress.current) return;
    if (phase === "recorded" || phase === "completed") return;
    operationInProgress.current = true;
    try {
      if (phase === "recording") {
        await stop();
        recordingStopped();
        return;
      }
      if (phase !== "user-ready" && phase !== "failed") return;

      if (phase === "failed") resetRecording();
      startedAtRef.current = Date.now();
      await start();
      recordingStarted();
    } finally {
      operationInProgress.current = false;
    }
  }, [phase, recordingStarted, recordingStopped, resetRecording, start, stop]);

  const save = React.useCallback(async () => {
    if (!audio || operationInProgress.current) return;
    operationInProgress.current = true;
    try {
      saveStarted();
      await saveRecording?.(audio);
      resetRecording();
      startedAtRef.current = null;
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

  return { phase, durationLabel, recordingState, recordedAudio: audio, retry, toggle, save };
}
