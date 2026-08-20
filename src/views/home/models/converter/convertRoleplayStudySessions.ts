// entities
import type { RoleplaySession } from "@/entities/roleplay-session";
import type { SessionId } from "@/entities/value-object";

// views
import type { GetLatestStudySession } from "@/views/home/models/interface";

export function convertRoleplayStudySessions(
  sessions: ReadonlyArray<RoleplaySession>,
  sessionStateById: ReadonlyMap<SessionId, GetLatestStudySession["sessionState"]>,
): GetLatestStudySession[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.materialTitleSnapshot,
    sessionDate: session.updatedAt,
    description: `문장 ${session.lineSnapshots.length}개`,
    sessionType: "role-playing",
    sessionState: sessionStateById.get(session.id) ?? "pending",
    href: getRoleplaySessionHref(session),
    disabled: session.state !== "completed",
  }));
}

function getRoleplaySessionHref(session: RoleplaySession) {
  if (session.state === "completed") {
    return `/roleplay-sessions/${session.id}/result`;
  }

  return undefined;
}
