import type { RolePlayRecordingClientProps } from "./ui";
import type { RecordingPhase } from "./interface";

export function resolveRoleplayTurn(
  partner: RolePlayRecordingClientProps["partner"],
  currentStep: number,
  totalSteps: number,
  isClosingPartner: boolean,
) {
  const turnIndex = Math.max(0, currentStep - 1);
  const activeTurn = partner.turns?.[turnIndex];
  const partnerLine = isClosingPartner
    ? activeTurn?.closingPartnerLine
    : (activeTurn?.partnerLine ?? (partner.turns ? "" : partner.line));
  const isLastTurn = currentStep >= totalSteps;
  const phaseOnStart: RecordingPhase = partnerLine ? "partner-speaking" : "user-ready";
  let phaseAfterSave: RecordingPhase = phaseOnStart;
  if (isLastTurn)
    phaseAfterSave = activeTurn?.closingPartnerLine ? "partner-speaking" : "completed";
  else if (partner.turns)
    phaseAfterSave = partner.turns[turnIndex + 1]?.partnerLine ? "partner-speaking" : "user-ready";
  return { activeTurn, partnerLine, isLastTurn, phaseOnStart, phaseAfterSave };
}
