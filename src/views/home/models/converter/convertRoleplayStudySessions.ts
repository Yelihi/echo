// entities
import type { RoleplaySession } from "@/entities/roleplay-session";

// views
import { mapStudySessionState } from "@/views/home/models/converter/mapStudySessionState";
import type { GetLatestStudySession } from "@/views/home/models/interface";

export function convertRoleplayStudySessions(
  sessions: ReadonlyArray<RoleplaySession>,
): GetLatestStudySession[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.materialTitleSnapshot,
    sessionDate: session.updatedAt,
    description: `문장 ${session.lineSnapshots.length}개`,
    sessionType: "role-playing",
    sessionState: mapStudySessionState(session.state),
    href: getRoleplaySessionHref(session),
    disabled: session.state === "deleted",
  }));
}

function getRoleplaySessionHref(session: RoleplaySession) {
  if (session.state === "completed") {
    return `/roleplay-sessions/${session.id}/result`;
  }

  if (session.state === "in_progress") {
    return `/role-playing/${session.id}/session`;
  }

  if (session.state === "ready") {
    return `/role-playing/${session.id}/ready`;
  }

  return undefined;
}
