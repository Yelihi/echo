// shared
import { createStore } from "@/shared/lib/store/create-store";

// views
import type { RolePlayReadyStore, RoleplayReadySettings } from "@/views/role-play/models/interface";

export const ROLE_PLAY_READY_DEFAULT_SETTINGS: RoleplayReadySettings = {
  role: "learner",
  evaluationMode: "context",
  voice: "soft",
  speed: 1,
};

export const useRolePlayReadyStore = createStore<RolePlayReadyStore>("rolePlayReady", (set) => ({
  settings: ROLE_PLAY_READY_DEFAULT_SETTINGS,
  setRole: (role) => set((state) => ({ settings: { ...state.settings, role } })),
  setEvaluationMode: (evaluationMode) =>
    set((state) => ({ settings: { ...state.settings, evaluationMode } })),
  setVoice: (voice) => set((state) => ({ settings: { ...state.settings, voice } })),
  setSpeed: (speed) => set((state) => ({ settings: { ...state.settings, speed } })),
  reset: () => set({ settings: ROLE_PLAY_READY_DEFAULT_SETTINGS }),
}));
