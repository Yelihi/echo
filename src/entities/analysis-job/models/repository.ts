import type {
  AnalysisJob,
  PracticeTargetAnalysisResult,
  SessionAnalysisSummary,
} from "@/entities/analysis-job/models/entity";
import type { AnalysisJobId, SessionId, UserId } from "@/entities/value-object";

export interface RequestAnalysisJobInput {
  readonly ownerId: UserId;
  readonly roleplaySessionId?: SessionId;
  readonly memorizationSessionId?: SessionId;
  readonly provider?: string;
}

export interface ClaimNextAnalysisJobInput {
  readonly provider?: string;
}

export interface FindAnalysisJobBySessionInput {
  readonly sessionId: SessionId;
  readonly provider?: string;
}

export interface FailAnalysisJobInput {
  readonly jobId: AnalysisJobId;
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly errorLogRef?: string | null;
}

export interface AnalysisJobRepositoryPort {
  findById(id: AnalysisJobId): Promise<AnalysisJob | null>;
  requestAnalysisJob(input: RequestAnalysisJobInput): Promise<AnalysisJob>;
  claimNextAnalysisJob(input?: ClaimNextAnalysisJobInput): Promise<AnalysisJob | null>;
  completeAnalysisJob(id: AnalysisJobId): Promise<AnalysisJob>;
  failAnalysisJob(input: FailAnalysisJobInput): Promise<AnalysisJob>;
  findCurrentByRoleplaySessionId(input: FindAnalysisJobBySessionInput): Promise<AnalysisJob | null>;
  findCurrentByMemorizationSessionId(
    input: FindAnalysisJobBySessionInput,
  ): Promise<AnalysisJob | null>;
  findHistoryByRoleplaySessionId(input: FindAnalysisJobBySessionInput): Promise<AnalysisJob[]>;
  findHistoryByMemorizationSessionId(input: FindAnalysisJobBySessionInput): Promise<AnalysisJob[]>;
  findByRoleplaySessionId(sessionId: SessionId): Promise<AnalysisJob | null>;
  findByMemorizationSessionId(sessionId: SessionId): Promise<AnalysisJob | null>;
  findResultsByJobId(analysisJobId: AnalysisJobId): Promise<PracticeTargetAnalysisResult[]>;
  findSummaryByJobId(analysisJobId: AnalysisJobId): Promise<SessionAnalysisSummary | null>;
}
