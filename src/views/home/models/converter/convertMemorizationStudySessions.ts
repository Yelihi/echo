import type { MemorizationSession } from "@/entities/memorization-session";

// views
import { mapStudySessionState } from "@/views/home/models/converter/mapStudySessionState";
import type { GetLatestStudySession } from "@/views/home/models/interface";

export function convertMemorizationStudySessions(
  sessions: ReadonlyArray<MemorizationSession>,
): GetLatestStudySession[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.materialTitleSnapshot,
    sessionDate: session.updatedAt,
    description: `문장 ${countMemorizationSentences(session.paragraphSnapshots)}개`,
    sessionType: "memorization",
    sessionState: mapStudySessionState(session.state),
    href: getMemorizationSessionHref(session),
    disabled: session.state === "deleted",
  }));
}

function getMemorizationSessionHref(session: MemorizationSession) {
  if (session.state === "completed") {
    return `/memorization-sessions/${session.id}/result`;
  }

  if (session.state === "in_progress") {
    return `/sentence-memorization/${session.id}/session`;
  }

  if (session.state === "ready") {
    return `/sentence-memorization/${session.id}/ready`;
  }

  return undefined;
}

function countMemorizationSentences(paragraphs: MemorizationSession["paragraphSnapshots"]) {
  return paragraphs.reduce((total, paragraph) => total + paragraph.sentences.length, 0);
}
