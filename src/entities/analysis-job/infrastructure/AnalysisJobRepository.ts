import type { SupabaseClient } from "@supabase/supabase-js";

// shared
import type { Database } from "@/shared/lib/supabase";

// entities
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
  AnalysisJobFetchError,
  AnalysisJobNotReturnedError,
  AnalysisJobRequestError,
} from "@/entities/analysis-job/models/errors";
import type {
  AnalysisJobRepositoryPort,
  ClaimNextAnalysisJobInput,
  FindAnalysisJobsBySessionIdsInput,
  FindAnalysisJobBySessionInput,
  RequestAnalysisJobInput,
} from "@/entities/analysis-job/models/repository";
import type { AnalysisJobId, SessionId } from "@/entities/value-object";

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

  async findLatestByRoleplaySessionIds(
    input: FindAnalysisJobsBySessionIdsInput,
  ): Promise<AnalysisJob[]> {
    return this.findLatestBySessionIds("roleplay_session_id", input);
  }

  async findLatestByMemorizationSessionIds(
    input: FindAnalysisJobsBySessionIdsInput,
  ): Promise<AnalysisJob[]> {
    return this.findLatestBySessionIds("memorization_session_id", input);
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

  private async findLatestBySessionIds(
    sessionColumn: "roleplay_session_id" | "memorization_session_id",
    input: FindAnalysisJobsBySessionIdsInput,
  ): Promise<AnalysisJob[]> {
    if (input.sessionIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("analysis_jobs")
      .select("*")
      .in(sessionColumn, [...input.sessionIds])
      .eq("provider", input.provider ?? "openai")
      .order("attempt_number", { ascending: false })
      .order("queued_at", { ascending: false });

    if (error) {
      throw new AnalysisJobFetchError("Failed to fetch latest analysis jobs by sessions.", {
        cause: error,
      });
    }

    const seen = new Set<string>();
    const latestJobs: AnalysisJob[] = [];

    for (const row of data) {
      const sessionId = row[sessionColumn];

      if (!sessionId || seen.has(sessionId)) {
        continue;
      }

      seen.add(sessionId);
      latestJobs.push(mapAnalysisJobRowToEntity(row));
    }

    return latestJobs;
  }
}

export function createAnalysisJobRepository(
  supabase: SupabaseClient<Database>,
): AnalysisJobRepositoryPort {
  return new AnalysisJobRepository(supabase);
}
