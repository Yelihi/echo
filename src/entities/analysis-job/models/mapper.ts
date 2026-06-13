import type {
  AnalysisJob,
  PracticeTargetAnalysisResult,
  SessionAnalysisSummary,
} from "@/entities/analysis-job/models/entity";
import { AnalysisJobState } from "@/entities/analysis-job/models/enums";
import { PracticeType } from "@/entities/practice-target";
import type { PracticeTarget } from "@/entities/practice-target";
import type { AnalysisJobId, LineId, SentenceId, SessionId, UserId } from "@/entities/value-object";
import type { Database, Json } from "@/shared/lib/supabase/database.types";

export type AnalysisJobRow = Database["public"]["Tables"]["analysis_jobs"]["Row"];
export type PracticeTargetAnalysisResultRow =
  Database["public"]["Tables"]["practice_target_analysis_results"]["Row"];
export type SessionAnalysisSummaryRow =
  Database["public"]["Tables"]["session_analysis_summaries"]["Row"];

export function mapAnalysisJobRowToEntity(row: AnalysisJobRow): AnalysisJob {
  const sessionTarget = mapSessionTarget(row, "analysis job");

  return {
    id: row.id as AnalysisJobId,
    ownerId: row.user_id as UserId,
    sessionId: sessionTarget.sessionId,
    practiceType: sessionTarget.practiceType,
    state: row.status as AnalysisJobState,
    provider: row.provider,
    queuedAt: new Date(row.queued_at),
    startedAt: row.started_at ? new Date(row.started_at) : null,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    failedAt: row.failed_at ? new Date(row.failed_at) : null,
    errorMessage: row.error_message,
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
    target: mapPracticeTarget(row),
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
  const sessionTarget = mapSessionTarget(row, "session analysis summary");

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

function mapPracticeTarget(row: PracticeTargetAnalysisResultRow): PracticeTarget {
  if (row.roleplay_session_id && row.roleplay_line_id) {
    if (row.memorization_session_id || row.memorization_sentence_id) {
      throw new Error(`Invalid practice target analysis result target: ${row.id}`);
    }

    return {
      practiceType: PracticeType.ROLEPLAY,
      sessionId: row.roleplay_session_id as SessionId,
      lineSnapshotId: row.roleplay_line_id as LineId,
    };
  }

  if (row.memorization_session_id && row.memorization_sentence_id) {
    if (row.roleplay_session_id || row.roleplay_line_id) {
      throw new Error(`Invalid practice target analysis result target: ${row.id}`);
    }

    return {
      practiceType: PracticeType.MEMORIZATION,
      sessionId: row.memorization_session_id as SessionId,
      sentenceSnapshotId: row.memorization_sentence_id as SentenceId,
    };
  }

  throw new Error(`Invalid practice target analysis result target: ${row.id}`);
}

function mapSessionTarget(
  row: Pick<
    AnalysisJobRow | SessionAnalysisSummaryRow,
    "id" | "roleplay_session_id" | "memorization_session_id"
  >,
  label: string,
): { practiceType: PracticeType; sessionId: SessionId } {
  if (row.roleplay_session_id) {
    if (row.memorization_session_id) {
      throw new Error(`Invalid ${label} session target: ${row.id}`);
    }

    return {
      practiceType: PracticeType.ROLEPLAY,
      sessionId: row.roleplay_session_id as SessionId,
    };
  }

  if (row.memorization_session_id) {
    return {
      practiceType: PracticeType.MEMORIZATION,
      sessionId: row.memorization_session_id as SessionId,
    };
  }

  throw new Error(`Invalid ${label} session target: ${row.id}`);
}

function mapJsonObject(value: Json, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label} JSON object`);
  }

  return value as Record<string, unknown>;
}
