import type { RecordingPhase } from "@/views/recording/models/interface";

export function clampRecordingStep(step: number, total: number): number {
  return Math.max(0, Math.min(step, total));
}

export function getInitialRecordingStep(
  phase: RecordingPhase,
  activeStep: number,
  totalSteps: number,
): number {
  return phase === "ready" ? 0 : clampRecordingStep(activeStep, totalSteps);
}

export function getNextRecordingPhase(hasPartnerTurn: boolean): RecordingPhase {
  return hasPartnerTurn ? "partner-speaking" : "user-ready";
}

export function getRecordingProgress(current: number, total: number): number {
  return total <= 0 ? 0 : (clampRecordingStep(current, total) / total) * 100;
}
