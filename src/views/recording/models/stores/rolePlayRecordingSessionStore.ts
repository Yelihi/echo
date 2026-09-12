import { createStoreApi } from "@/shared/lib/store/create-store";
import { clampRecordingStep } from "@/views/recording/models/recordingSessionProgress";
import {
  createRecordingSessionBaseSlice,
  type HydrateRecordingSessionInput,
  type RecordingSessionBaseStore,
} from "@/views/recording/models/stores/createRecordingSessionStore";

interface RolePlayRecordingSessionState {
  partnerPlaybackBlocked: boolean;
  canReplayPartner: boolean;
  closingPartner: boolean;
}

interface RolePlayRecordingSessionActions {
  partnerPlaySucceeded: () => void;
  partnerPlayFailed: () => void;
}

export type RolePlayRecordingSessionStore = RecordingSessionBaseStore &
  RolePlayRecordingSessionState &
  RolePlayRecordingSessionActions;

const ROLE_PLAY_INITIAL_STATE: RolePlayRecordingSessionState = {
  partnerPlaybackBlocked: false,
  canReplayPartner: false,
  closingPartner: false,
};

export function createRolePlayRecordingSessionStore(
  initial: HydrateRecordingSessionInput,
  closingPartner = false,
) {
  return createStoreApi<RolePlayRecordingSessionStore>("rolePlayRecordingSession", (set) => ({
    ...createRecordingSessionBaseSlice<RolePlayRecordingSessionStore>(set, initial),
    ...ROLE_PLAY_INITIAL_STATE,
    currentStep: clampRecordingStep(initial.activeStep, initial.totalSteps),
    closingPartner,
    canReplayPartner: initial.initialPhase === "user-ready" || initial.initialPhase === "recorded",
    partnerPlaySucceeded: () =>
      set((state) => ({
        phase: state.closingPartner ? "completed" : "user-ready",
        partnerPlaybackBlocked: false,
        canReplayPartner: true,
      })),
    partnerPlayFailed: () => set({ partnerPlaybackBlocked: true, canReplayPartner: true }),
    startTurn: (totalSteps, nextPhase) =>
      set((state) => ({
        currentStep:
          state.currentStep === 0 ? clampRecordingStep(1, totalSteps) : state.currentStep,
        phase: nextPhase,
        saveFailed: false,
        partnerPlaybackBlocked: false,
        canReplayPartner: false,
      })),
    saveSucceeded: (totalSteps, nextPhase) =>
      set((state) => ({
        currentStep: clampRecordingStep(state.currentStep + 1, totalSteps),
        elapsedMs: 0,
        saving: false,
        saveFailed: false,
        partnerPlaybackBlocked: false,
        canReplayPartner: false,
        closingPartner: state.currentStep >= totalSteps && nextPhase === "partner-speaking",
        phase:
          state.currentStep >= totalSteps && nextPhase !== "partner-speaking"
            ? "completed"
            : nextPhase,
      })),
  }));
}
