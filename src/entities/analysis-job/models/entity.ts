import type { PracticeTarget, PracticeType } from "@/entities/practice-target";
import type { AnalysisJobId, SessionId, UserId } from "@/entities/value-object";

import type { AnalysisJobState } from "./enums";

export interface AnalysisJob {
  readonly id: AnalysisJobId;
  readonly ownerId: UserId;
  readonly sessionId: SessionId;
  readonly practiceType: PracticeType;
  readonly state: AnalysisJobState;
  readonly provider: string;
  readonly queuedAt: Date;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly failedAt: Date | null;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PracticeTargetAnalysisResult {
  readonly id: string;
  readonly ownerId: UserId;
  readonly analysisJobId: AnalysisJobId;
  readonly target: PracticeTarget;
  readonly transcript: string;
  readonly feedback: Record<string, unknown>;
  readonly score: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SessionAnalysisSummary {
  readonly id: string;
  readonly ownerId: UserId;
  readonly analysisJobId: AnalysisJobId;
  readonly sessionId: SessionId;
  readonly practiceType: PracticeType;
  readonly summary: Record<string, unknown>;
  readonly score: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
