// entities
import type { RoleplaySession } from "@/entities/roleplay-session";

export function getRolePlayPartnerSpeakerOrder(selectedLearnerSpeakerOrder: 1 | 2): 1 | 2 {
  return selectedLearnerSpeakerOrder === 1 ? 2 : 1;
}

export function selectRolePlaySessionPartner(session: RoleplaySession) {
  const partnerOrder = getRolePlayPartnerSpeakerOrder(session.selectedLearnerSpeakerOrder);
  const speaker = session.speakerSnapshots.find((item) => item.order === partnerOrder);
  const line = session.lineSnapshots.find(
    (item) => item.speakerOrder === partnerOrder && item.text.trim().length > 0,
  );

  return {
    partnerOrder,
    partnerRole: speaker?.displayName,
    partnerLine: line?.text,
  };
}
