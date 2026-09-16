import type { RoleplayRecordingTurn } from "@/entities/roleplay-session/models/recordingTurns";
import type { RolePlayRecordingViewProps } from "./ui";

export function getRoleplayResume(
  turns: readonly RoleplayRecordingTurn[],
  savedLineIds: readonly (string | null)[],
): RolePlayRecordingViewProps["resume"] {
  const saved = new Set(savedLineIds);
  const savedCount = turns.filter((turn) => saved.has(turn.learnerLineId)).length;
  if (!savedCount) return undefined;
  const pending = turns.findIndex((turn) => !saved.has(turn.learnerLineId));
  const closingPartner = pending === -1 && Boolean(turns.at(-1)?.closingPartnerLine);
  return {
    step: pending === -1 ? turns.length : pending + 1,
    savedCount,
    closingPartner,
    // All audio is persisted; only the final exchange/completion request may remain.
    phase: pending === -1 && !closingPartner ? "completed" : "ready",
  };
}
