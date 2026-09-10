import "server-only";
import type { SessionId, UserId } from "@/entities/value-object";
import {
  SessionAnalysisUnavailable,
  type CompletedAnalysisSession,
  type LoadedSessionAnalysis,
  type SessionAnalysisReader,
} from "../../models/sessionAnalysisReader";

export async function loadSessionAnalysis<Session extends CompletedAnalysisSession>(
  sessionId: SessionId,
  ownerId: UserId,
  reader: SessionAnalysisReader<Session>,
): Promise<LoadedSessionAnalysis<Session>> {
  const session = await reader.findSession(sessionId);
  if (!session || session.ownerId !== ownerId || session.state !== "completed") {
    throw new SessionAnalysisUnavailable();
  }
  // 실패한 job의 부분 결과도 읽는다. 조회에는 job 생성 권한을 전달하지 않는다.
  const [latestJob] = await reader.findHistory(sessionId);
  const [acceptedRecordings, sourceResults] = await Promise.all([
    reader.findRecordings(sessionId),
    latestJob ? reader.findResults(latestJob.id) : Promise.resolve([]),
  ]);
  return { session, job: latestJob ?? null, acceptedRecordings, sourceResults };
}
