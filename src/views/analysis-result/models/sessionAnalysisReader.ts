import type { AcceptedRecording } from "@/entities/accepted-recording";
import type { AnalysisJob, PracticeTargetAnalysisResult } from "@/entities/analysis-job";
import type { AnalysisJobId, SessionId, UserId } from "@/entities/value-object";

export interface CompletedAnalysisSession {
  ownerId: UserId;
  state: string;
}
export interface SessionAnalysisReader<Session extends CompletedAnalysisSession> {
  findSession(id: SessionId): Promise<Session | null>;
  findHistory(id: SessionId): Promise<AnalysisJob[]>;
  findRecordings(id: SessionId): Promise<AcceptedRecording[]>;
  findResults(id: AnalysisJobId): Promise<PracticeTargetAnalysisResult[]>;
}
export interface LoadedSessionAnalysis<Session> {
  session: Session;
  job: AnalysisJob | null;
  acceptedRecordings: AcceptedRecording[];
  sourceResults: PracticeTargetAnalysisResult[];
}
export class SessionAnalysisUnavailable extends Error {
  constructor() {
    super("Session analysis unavailable");
  }
}
