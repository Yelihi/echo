import type { StateCreator } from "zustand";

import type { RecordingPhase } from "@/views/recording/models/interface";
import {
  clampRecordingStep,
  getInitialRecordingStep,
} from "@/views/recording/models/recordingSessionProgress";

export interface HydrateRecordingSessionInput {
  readonly initialPhase: RecordingPhase;
  readonly activeStep: number;
  readonly totalSteps: number;
  readonly demoDurationMs: number;
}

export interface RecordingSessionBaseState {
  phase: RecordingPhase;
  currentStep: number;
  elapsedMs: number;
  saving: boolean;
  saveFailed: boolean;
}

export interface RecordingSessionBaseActions {
  startTurn: (totalSteps: number, nextPhase: RecordingPhase) => void;
  recordingStarted: () => void;
  recordingStopped: () => void;
  saveStarted: () => void;
  saveSucceeded: (totalSteps: number, nextPhase: RecordingPhase) => void;
  saveFailure: () => void;
  retryRecording: () => void;
  setElapsedMs: (elapsedMs: number) => void;
}

export type RecordingSessionBaseStore = RecordingSessionBaseState & RecordingSessionBaseActions;

export function getRecordingSessionInitialState({
  initialPhase,
  activeStep,
  totalSteps,
  demoDurationMs,
}: HydrateRecordingSessionInput): RecordingSessionBaseState {
  return {
    phase: initialPhase,
    currentStep: getInitialRecordingStep(initialPhase, activeStep, totalSteps),
    elapsedMs: demoDurationMs,
    saving: false,
    saveFailed: false,
  };
}

export function createRecordingSessionBaseSlice<T extends RecordingSessionBaseStore>(
  set: Parameters<StateCreator<T>>[0],
  initial: HydrateRecordingSessionInput,
): RecordingSessionBaseStore {
  return {
    ...getRecordingSessionInitialState(initial),
    startTurn: (totalSteps, nextPhase) =>
      set(
        (state) =>
          ({
            currentStep:
              state.currentStep === 0 ? clampRecordingStep(1, totalSteps) : state.currentStep,
            phase: nextPhase,
            saveFailed: false,
          }) as Partial<T>,
      ),
    recordingStarted: () =>
      set({ phase: "recording", elapsedMs: 0, saveFailed: false } as Partial<T>),
    recordingStopped: () => set({ phase: "recorded", saveFailed: false } as Partial<T>),
    saveStarted: () => set({ saving: true, saveFailed: false } as Partial<T>),
    saveSucceeded: (totalSteps, nextPhase) =>
      set(
        (state) =>
          ({
            currentStep: clampRecordingStep(state.currentStep + 1, totalSteps),
            elapsedMs: 0,
            saving: false,
            saveFailed: false,
            phase: state.currentStep >= totalSteps ? "completed" : nextPhase,
          }) as Partial<T>,
      ),
    saveFailure: () => set({ phase: "recorded", saving: false, saveFailed: true } as Partial<T>),
    retryRecording: () =>
      set({ phase: "user-ready", elapsedMs: 0, saveFailed: false } as Partial<T>),
    setElapsedMs: (elapsedMs) => set({ elapsedMs } as Partial<T>),
  };
}
