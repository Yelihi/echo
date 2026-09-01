// entities
import type { RoleplaySession } from "@/entities/roleplay-session";

// views
import type { RoleplayReadyMaterial } from "@/views/role-play/models/interface";
import { selectRolePlaySessionPartner } from "@/views/role-play/models/selectRolePlaySessionPartner";

export function convertRolePlaySessionToRecordingMaterial(
  session: RoleplaySession,
  routeMaterialId: string,
): RoleplayReadyMaterial {
  const learnerTurnCount = session.lineSnapshots.filter(
    (line) => line.speakerOrder === session.selectedLearnerSpeakerOrder,
  ).length;
  const partner = selectRolePlaySessionPartner(session);

  return {
    id: routeMaterialId,
    tags: session.tagsSnapshot.map((tag) => tag.displayName),
    title: session.materialTitleSnapshot,
    description: session.situationSnapshot,
    lineCount: session.lineSnapshots.length,
    learnerTurnCount,
    estimatedMinutes: Math.max(1, Math.ceil(session.lineSnapshots.length / 3)),
    partnerRole: partner.partnerRole,
    partnerLine: partner.partnerLine,
  };
}
