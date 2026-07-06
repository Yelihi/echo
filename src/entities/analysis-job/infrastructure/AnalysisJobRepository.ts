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
import {
  AnalysisJobClaimError,
  AnalysisJobCompleteError,
  AnalysisJobFailError,
  AnalysisJobFetchError,
  AnalysisJobNotReturnedError,
  AnalysisJobRequestError,
} from "@/entities/analysis-job/models/errors";
import type {
  AnalysisJobRepositoryPort,
  ClaimNextAnalysisJobInput,
  FailAnalysisJobInput,
  FindAnalysisJobBySessionInput,
  RequestAnalysisJobInput,
} from "@/entities/analysis-job/models/repository";
import type { AnalysisJobId, SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

const CURRENT_ANALYSIS_JOB_STATUSES = ["queued", "processing", "completed"] as const;

export class AnalysisJobRepository implements AnalysisJobRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: AnalysisJobId): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new AnalysisJobFetchError("Failed to fetch analysis job.", { cause: error });
    }

    return data ? mapAnalysisJobRowToEntity(data) : null;
  }

  async requestAnalysisJob(input: RequestAnalysisJobInput): Promise<AnalysisJob> {
    const { data, error } = await this.supabase
      .rpc("request_analysis_job", {
        p_user_id: input.ownerId,
        p_roleplay_session_id: input.roleplaySessionId ?? null,
        p_memorization_session_id: input.memorizationSessionId ?? null,
        p_provider: input.provider ?? "openai",
      })
      .maybeSingle();

    if (error) {
      throw new AnalysisJobRequestError({ cause: error });
    }

    if (!data) {
      throw new AnalysisJobNotReturnedError("request");
    }

    return mapAnalysisJobRowToEntity(data);
  }

  async claimNextAnalysisJob(input: ClaimNextAnalysisJobInput = {}): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .rpc("claim_next_analysis_job", {
        p_provider: input.provider ?? "openai",
      })
      .maybeSingle();

    if (error) {
      throw new AnalysisJobClaimError({ cause: error });
    }

    return data ? mapAnalysisJobRowToEntity(data) : null;
  }

  async completeAnalysisJob(id: AnalysisJobId): Promise<AnalysisJob> {
    const { data, error } = await this.supabase
      .rpc("complete_analysis_job", {
        p_job_id: id,
      })
      .maybeSingle();

    if (error) {
      throw new AnalysisJobCompleteError({ cause: error });
    }

    if (!data) {
      throw new AnalysisJobNotReturnedError("complete");
    }

    return mapAnalysisJobRowToEntity(data);
  }

  async failAnalysisJob(input: FailAnalysisJobInput): Promise<AnalysisJob> {
    const { data, error } = await this.supabase
      .rpc("fail_analysis_job", {
        p_job_id: input.jobId,
        p_error_code: input.errorCode,
        p_error_message: input.errorMessage,
        p_error_log_ref: input.errorLogRef ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new AnalysisJobFailError({ cause: error });
    }

    if (!data) {
      throw new AnalysisJobNotReturnedError("fail");
    }

    return mapAnalysisJobRowToEntity(data);
  }

  async findCurrentByRoleplaySessionId(
    input: FindAnalysisJobBySessionInput,
  ): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("roleplay_session_id", input.sessionId)
      .eq("provider", input.provider ?? "openai")
      .in("status", [...CURRENT_ANALYSIS_JOB_STATUSES])
      .maybeSingle();

    if (error) {
      throw new AnalysisJobFetchError("Failed to fetch current analysis job by roleplay session.", {
        cause: error,
      });
    }

    return data ? mapAnalysisJobRowToEntity(data) : null;
  }

  async findCurrentByMemorizationSessionId(
    input: FindAnalysisJobBySessionInput,
  ): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("memorization_session_id", input.sessionId)
      .eq("provider", input.provider ?? "openai")
      .in("status", [...CURRENT_ANALYSIS_JOB_STATUSES])
      .maybeSingle();

    if (error) {
      throw new AnalysisJobFetchError(
        "Failed to fetch current analysis job by memorization session.",
        { cause: error },
      );
    }

    return data ? mapAnalysisJobRowToEntity(data) : null;
  }

  async findHistoryByRoleplaySessionId(
    input: FindAnalysisJobBySessionInput,
  ): Promise<AnalysisJob[]> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("roleplay_session_id", input.sessionId)
      .eq("provider", input.provider ?? "openai")
      .order("attempt_number", { ascending: false })
      .order("queued_at", { ascending: false });

    if (error) {
      throw new AnalysisJobFetchError("Failed to fetch analysis job history by roleplay session.", {
        cause: error,
      });
    }

    return data.map(mapAnalysisJobRowToEntity);
  }

  async findHistoryByMemorizationSessionId(
    input: FindAnalysisJobBySessionInput,
  ): Promise<AnalysisJob[]> {
    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .eq("memorization_session_id", input.sessionId)
      .eq("provider", input.provider ?? "openai")
      .order("attempt_number", { ascending: false })
      .order("queued_at", { ascending: false });

    if (error) {
      throw new AnalysisJobFetchError(
        "Failed to fetch analysis job history by memorization session.",
        { cause: error },
      );
    }

    return data.map(mapAnalysisJobRowToEntity);
  }

  async findByRoleplaySessionId(sessionId: SessionId): Promise<AnalysisJob | null> {
    return this.findCurrentByRoleplaySessionId({ sessionId });
  }

  async findByMemorizationSessionId(sessionId: SessionId): Promise<AnalysisJob | null> {
    return this.findCurrentByMemorizationSessionId({ sessionId });
  }

  async findResultsByJobId(analysisJobId: AnalysisJobId): Promise<PracticeTargetAnalysisResult[]> {
    const { data, error } = await this.supabase
      .from("practice_target_analysis_results")
      .select("*")
      .eq("analysis_job_id", analysisJobId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new AnalysisJobFetchError("Failed to fetch practice target analysis results.", {
        cause: error,
      });
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
      throw new AnalysisJobFetchError("Failed to fetch session analysis summary.", {
        cause: error,
      });
    }

    return data ? mapSessionAnalysisSummaryRowToEntity(data) : null;
  }
}

export function createAnalysisJobRepository(
  supabase: SupabaseClient<Database>,
): AnalysisJobRepositoryPort {
  return new AnalysisJobRepository(supabase);
}
