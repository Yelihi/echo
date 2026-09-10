import type { RoleplaySession } from "@/entities/roleplay-session";

export interface RoleplayRecordingTurn {
  readonly learnerLineId: string;
  readonly partnerLine: string;
  readonly closingPartnerLine?: string;
}

export function createRoleplayRecordingTurns(session: RoleplaySession): RoleplayRecordingTurn[] {
  const turns: RoleplayRecordingTurn[] = [];
  let prompts: string[] = [];
  for (const line of [...session.lineSnapshots].sort((a, b) => a.order - b.order)) {
    if (line.speakerOrder === session.selectedLearnerSpeakerOrder) {
      turns.push({ learnerLineId: line.id, partnerLine: prompts.join(" ") });
      prompts = [];
    } else {
      prompts.push(line.text);
    }
  }
  if (prompts.length && turns.length) {
    turns[turns.length - 1] = { ...turns[turns.length - 1], closingPartnerLine: prompts.join(" ") };
  }
  return turns;
}
