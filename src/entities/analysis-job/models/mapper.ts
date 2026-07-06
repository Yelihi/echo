import type {
  AnalysisJob,
  PracticeTargetAnalysisResult,
  SessionAnalysisSummary,
} from "@/entities/analysis-job/models/entity";
import { AnalysisJobInvalidRowError } from "@/entities/analysis-job/models/errors";
import { AnalysisJobState } from "@/entities/analysis-job/models/enums";
import {
  mapPracticeTargetFields,
  mapSessionPracticeTargetFields,
} from "@/entities/practice-target";
import type { AnalysisJobId, UserId } from "@/entities/value-object";
import type { Database, Json } from "@/shared/lib/supabase/database.types";

export type AnalysisJobRow = Database["public"]["Tables"]["analysis_jobs"]["Row"];
export type PracticeTargetAnalysisResultRow =
  Database["public"]["Tables"]["practice_target_analysis_results"]["Row"];
export type SessionAnalysisSummaryRow =
  Database["public"]["Tables"]["session_analysis_summaries"]["Row"];

export function mapAnalysisJobRowToEntity(row: AnalysisJobRow): AnalysisJob {
  const sessionTarget = mapSessionPracticeTargetFields(row, "analysis job");

  return {
    id: row.id as AnalysisJobId,
    ownerId: row.user_id as UserId,
    sessionId: sessionTarget.sessionId,
    practiceType: sessionTarget.practiceType,
    state: row.status as AnalysisJobState,
    provider: row.provider,
    attemptNumber: row.attempt_number,
    queuedAt: new Date(row.queued_at),
    startedAt: row.started_at ? new Date(row.started_at) : null,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    failedAt: row.failed_at ? new Date(row.failed_at) : null,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    errorLogRef: row.error_log_ref,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapPracticeTargetAnalysisResultRowToEntity(
  row: PracticeTargetAnalysisResultRow,
): PracticeTargetAnalysisResult {
  return {
    id: row.id,
    ownerId: row.user_id as UserId,
    analysisJobId: row.analysis_job_id as AnalysisJobId,
    target: mapPracticeTargetFields(row, "practice target analysis result"),
    transcript: row.transcript,
    feedback: mapJsonObject(row.feedback, "practice target analysis feedback"),
    score: row.score,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapSessionAnalysisSummaryRowToEntity(
  row: SessionAnalysisSummaryRow,
): SessionAnalysisSummary {
  const sessionTarget = mapSessionPracticeTargetFields(row, "session analysis summary");

  return {
    id: row.id,
    ownerId: row.user_id as UserId,
    analysisJobId: row.analysis_job_id as AnalysisJobId,
    sessionId: sessionTarget.sessionId,
    practiceType: sessionTarget.practiceType,
    summary: mapJsonObject(row.summary, "session analysis summary"),
    score: row.score,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapJsonObject(value: Json, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AnalysisJobInvalidRowError(`Invalid ${label} JSON object`);
  }

  return value as Record<string, unknown>;
}
