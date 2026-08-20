import type { MemorizationSession } from "@/entities/memorization-session";
import type { SessionId } from "@/entities/value-object";

// views
import type { GetLatestStudySession } from "@/views/home/models/interface";

export function convertMemorizationStudySessions(
  sessions: ReadonlyArray<MemorizationSession>,
  sessionStateById: ReadonlyMap<SessionId, GetLatestStudySession["sessionState"]>,
): GetLatestStudySession[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.materialTitleSnapshot,
    sessionDate: session.updatedAt,
    description: `문장 ${countMemorizationSentences(session.paragraphSnapshots)}개`,
    sessionType: "memorization",
    sessionState: sessionStateById.get(session.id) ?? "pending",
    href: getMemorizationSessionHref(session),
    disabled: session.state !== "completed",
  }));
}

function getMemorizationSessionHref(session: MemorizationSession) {
  if (session.state === "completed") {
    return `/memorization-sessions/${session.id}/result`;
  }

  return undefined;
}

function countMemorizationSentences(paragraphs: MemorizationSession["paragraphSnapshots"]) {
  return paragraphs.reduce((total, paragraph) => total + paragraph.sentences.length, 0);
}
