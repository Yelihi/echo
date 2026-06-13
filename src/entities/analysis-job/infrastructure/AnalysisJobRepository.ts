import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AnalysisJob,
  PracticeTargetAnalysisResult,
  SessionAnalysisSummary,
} from "@/entities/analysis-job/models/entity";
import {
  mapAnalysisJobRowToEntity,
  mapPracticeTargetAnalysisResultRowToEntity,
  mapSessionAnalysisSummaryRowToEntity,
} from "@/entities/analysis-job/models/mapper";
import type { AnalysisJobRepositoryPort } from "@/entities/analysis-job/models/repository";
import type { AnalysisJobId, SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export class AnalysisJobRepository implements AnalysisJobRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: AnalysisJobId): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch analysis job: ${error.message}`);
    }

    return data ? mapAnalysisJobRowToEntity(data) : null;
  }

  async findByRoleplaySessionId(sessionId: SessionId): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("roleplay_session_id", sessionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch analysis job by roleplay session: ${error.message}`);
    }

    return data ? mapAnalysisJobRowToEntity(data) : null;
  }

  async findByMemorizationSessionId(sessionId: SessionId): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("memorization_session_id", sessionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch analysis job by memorization session: ${error.message}`);
    }

    return data ? mapAnalysisJobRowToEntity(data) : null;
  }

  async findResultsByJobId(analysisJobId: AnalysisJobId): Promise<PracticeTargetAnalysisResult[]> {
    const { data, error } = await this.supabase
      .from("practice_target_analysis_results")
      .select("*")
      .eq("analysis_job_id", analysisJobId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch practice target analysis results: ${error.message}`);
    }

    return data.map(mapPracticeTargetAnalysisResultRowToEntity);
  }

  async findSummaryByJobId(analysisJobId: AnalysisJobId): Promise<SessionAnalysisSummary | null> {
    const { data, error } = await this.supabase
      .from("session_analysis_summaries")
      .select("*")
      .eq("analysis_job_id", analysisJobId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch session analysis summary: ${error.message}`);
    }

    return data ? mapSessionAnalysisSummaryRowToEntity(data) : null;
  }
}

export function createAnalysisJobRepository(
  supabase: SupabaseClient<Database>,
): AnalysisJobRepositoryPort {
  return new AnalysisJobRepository(supabase);
}
