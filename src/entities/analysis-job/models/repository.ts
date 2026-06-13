import type {
  AnalysisJob,
  PracticeTargetAnalysisResult,
  SessionAnalysisSummary,
} from "@/entities/analysis-job/models/entity";
import type { AnalysisJobId, SessionId } from "@/entities/value-object";

export interface AnalysisJobRepositoryPort {
  findById(id: AnalysisJobId): Promise<AnalysisJob | null>;
  findByRoleplaySessionId(sessionId: SessionId): Promise<AnalysisJob | null>;
  findByMemorizationSessionId(sessionId: SessionId): Promise<AnalysisJob | null>;
  findResultsByJobId(analysisJobId: AnalysisJobId): Promise<PracticeTargetAnalysisResult[]>;
  findSummaryByJobId(analysisJobId: AnalysisJobId): Promise<SessionAnalysisSummary | null>;
}
