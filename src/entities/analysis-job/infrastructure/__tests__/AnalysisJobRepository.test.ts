import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

import { AnalysisJobRepository } from "@/entities/analysis-job/infrastructure/AnalysisJobRepository";
import {
  AnalysisJobFetchError,
  AnalysisJobNotReturnedError,
  AnalysisJobRequestError,
} from "@/entities/analysis-job/models/errors";
import type { AnalysisJobRow } from "@/entities/analysis-job/models/mapper";
import type { AnalysisJobId, SessionId, UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

describe("AnalysisJobRepository", () => {
  it("역할극 분석 Job 요청을 lifecycle RPC로 위임한다", async () => {
    const row = createAnalysisJobRow({ attempt_number: 2, status: "queued" });
    const { client, rpc } = createSupabaseStub({
      rpc: {
        request_analysis_job: queryResult(row),
      },
    });
    const repository = new AnalysisJobRepository(client);

    const job = await repository.requestAnalysisJob({
      ownerId: row.user_id as UserId,
      roleplaySessionId: row.roleplay_session_id as SessionId,
      provider: "openai",
    });

    expect(job).toMatchObject({
      id: row.id,
      ownerId: row.user_id,
      sessionId: row.roleplay_session_id,
      attemptNumber: 2,
      state: "queued",
    });
    expect(rpc).toHaveBeenCalledWith("request_analysis_job", {
      p_memorization_session_id: null,
      p_provider: "openai",
      p_roleplay_session_id: row.roleplay_session_id,
      p_user_id: row.user_id,
    });
  });

  it("역할극 current Job 조회 시 queued, processing, completed 상태만 조회한다", async () => {
    const row = createAnalysisJobRow({ status: "processing" });
    const query = createQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        analysis_jobs: [query],
      },
    });
    const repository = new AnalysisJobRepository(client);

    const job = await repository.findCurrentByRoleplaySessionId({
      sessionId: row.roleplay_session_id as SessionId,
      provider: "openai",
    });

    expect(job?.id).toBe(row.id);
    expect(query.eq).toHaveBeenCalledWith("roleplay_session_id", row.roleplay_session_id);
    expect(query.eq).toHaveBeenCalledWith("provider", "openai");
    expect(query.in).toHaveBeenCalledWith("status", ["queued", "processing", "completed"]);
    expect(query.maybeSingle).toHaveBeenCalledTimes(1);
  });

  it("역할극 Job 이력을 최신 시도 순서로 조회한다", async () => {
    const rows = [
      createAnalysisJobRow({ id: "22222222-2222-4222-8222-222222222222", attempt_number: 2 }),
      createAnalysisJobRow({ id: "11111111-1111-4111-8111-111111111111", attempt_number: 1 }),
    ];
    const query = createQuery(queryResult(rows));
    const { client } = createSupabaseStub({
      tables: {
        analysis_jobs: [query],
      },
    });
    const repository = new AnalysisJobRepository(client);

    const history = await repository.findHistoryByRoleplaySessionId({
      sessionId: rows[0].roleplay_session_id as SessionId,
      provider: "openai",
    });

    expect(history.map((job) => job.attemptNumber)).toEqual([2, 1]);
    expect(query.eq).toHaveBeenCalledWith("provider", "openai");
    expect(query.order).toHaveBeenCalledWith("attempt_number", { ascending: false });
    expect(query.order).toHaveBeenCalledWith("queued_at", { ascending: false });
  });

  it("다음 queued 분석 Job claim을 lifecycle RPC로 위임한다", async () => {
    const row = createAnalysisJobRow({ status: "processing", started_at: "2026-07-03T00:01:00Z" });
    const { client, rpc } = createSupabaseStub({
      rpc: {
        claim_next_analysis_job: queryResult(row),
      },
    });
    const repository = new AnalysisJobRepository(client);

    const job = await repository.claimNextAnalysisJob({ provider: "openai" });

    expect(job?.state).toBe("processing");
    expect(rpc).toHaveBeenCalledWith("claim_next_analysis_job", { p_provider: "openai" });
  });

  it("processing Job 완료 처리를 lifecycle RPC로 위임한다", async () => {
    const row = createAnalysisJobRow({ status: "completed" });
    const { client, rpc } = createSupabaseStub({
      rpc: {
        complete_analysis_job: queryResult(row),
      },
    });
    const repository = new AnalysisJobRepository(client);

    const job = await repository.completeAnalysisJob(row.id as AnalysisJobId);

    expect(job.state).toBe("completed");
    expect(rpc).toHaveBeenCalledWith("complete_analysis_job", { p_job_id: row.id });
  });

  it("processing Job 실패 처리를 정제된 에러 메타데이터와 함께 lifecycle RPC로 위임한다", async () => {
    const row = createAnalysisJobRow({
      status: "failed",
      completed_at: null,
      failed_at: "2026-07-03T00:02:00Z",
      error_code: "EVAL-003",
      error_message: "Evaluation provider failed.",
      error_log_ref: "glitchtip:event:123",
    });
    const { client, rpc } = createSupabaseStub({
      rpc: {
        fail_analysis_job: queryResult(row),
      },
    });
    const repository = new AnalysisJobRepository(client);

    const job = await repository.failAnalysisJob({
      jobId: row.id as AnalysisJobId,
      errorCode: "EVAL-003",
      errorMessage: "Evaluation provider failed.",
      errorLogRef: "glitchtip:event:123",
    });

    expect(job).toMatchObject({
      state: "failed",
      errorCode: "EVAL-003",
      errorMessage: "Evaluation provider failed.",
      errorLogRef: "glitchtip:event:123",
    });
    expect(rpc).toHaveBeenCalledWith("fail_analysis_job", {
      p_error_code: "EVAL-003",
      p_error_log_ref: "glitchtip:event:123",
      p_error_message: "Evaluation provider failed.",
      p_job_id: row.id,
    });
  });

  it("조회 실패를 CustomError로 매핑한다", async () => {
    const { client } = createSupabaseStub({
      tables: {
        analysis_jobs: [
          queryResult(null, { message: "database unavailable" }),
          queryResult(null, { message: "database unavailable" }),
        ],
      },
    });
    const repository = new AnalysisJobRepository(client);

    await expect(
      repository.findCurrentByRoleplaySessionId({
        sessionId: "22222222-2222-4222-8222-222222222222" as SessionId,
      }),
    ).rejects.toMatchObject({
      code: "ANALYSIS-001",
    });
    await expect(
      repository.findCurrentByRoleplaySessionId({
        sessionId: "22222222-2222-4222-8222-222222222222" as SessionId,
      }),
    ).rejects.toBeInstanceOf(AnalysisJobFetchError);
  });

  it("Job 요청 실패를 CustomError로 매핑한다", async () => {
    const { client } = createSupabaseStub({
      rpc: {
        request_analysis_job: queryResult(null, { message: "rpc unavailable" }),
      },
    });
    const repository = new AnalysisJobRepository(client);

    await expect(
      repository.requestAnalysisJob({
        ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
        roleplaySessionId: "22222222-2222-4222-8222-222222222222" as SessionId,
      }),
    ).rejects.toBeInstanceOf(AnalysisJobRequestError);
  });

  it("Job 요청 결과가 비어 있으면 CustomError로 매핑한다", async () => {
    const { client } = createSupabaseStub({
      rpc: {
        request_analysis_job: queryResult(null),
      },
    });
    const repository = new AnalysisJobRepository(client);

    await expect(
      repository.requestAnalysisJob({
        ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
        roleplaySessionId: "22222222-2222-4222-8222-222222222222" as SessionId,
      }),
    ).rejects.toBeInstanceOf(AnalysisJobNotReturnedError);
  });
});

interface QueryError {
  readonly message: string;
}

interface QueryResult<TData> {
  readonly data: TData;
  readonly error: QueryError | null;
}

type QueryStub = ReturnType<typeof createQuery>;
type QueryInput = QueryStub | QueryResult<unknown>;

function queryResult<TData>(data: TData, error: QueryError | null = null): QueryResult<TData> {
  return { data, error };
}

function createQuery(result: QueryResult<unknown>) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
    order: jest.fn(),
    maybeSingle: jest.fn(async () => result),
    then: (
      onFulfilled: (value: QueryResult<unknown>) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.order.mockReturnValue(query);

  return query;
}

function createSupabaseStub({
  tables = {},
  rpc = {},
}: {
  readonly tables?: Record<string, QueryInput[]>;
  readonly rpc?: Record<string, QueryResult<unknown>>;
}) {
  const queues = Object.fromEntries(
    Object.entries(tables).map(([table, queries]) => [
      table,
      queries.map((query) => ("select" in query ? query : createQuery(query))),
    ]),
  ) as Record<string, QueryStub[]>;
  const from = jest.fn((table: string) => {
    const query = queues[table]?.shift();

    if (!query) {
      throw new Error(`Missing Supabase query stub for table: ${table}`);
    }

    return query;
  });
  const rpcStub = jest.fn((functionName: string) => {
    const result = rpc[functionName];

    if (!result) {
      throw new Error(`Missing Supabase RPC stub for function: ${functionName}`);
    }

    return createQuery(result);
  });

  return {
    client: { from, rpc: rpcStub } as unknown as SupabaseClient<Database>,
    from,
    rpc: rpcStub,
  };
}

function createAnalysisJobRow(overrides: Partial<AnalysisJobRow> = {}): AnalysisJobRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    roleplay_session_id: "22222222-2222-4222-8222-222222222222",
    memorization_session_id: null,
    status: "completed",
    provider: "openai",
    attempt_number: 1,
    queued_at: "2026-07-03T00:00:00.000Z",
    started_at: "2026-07-03T00:01:00.000Z",
    completed_at: "2026-07-03T00:02:00.000Z",
    failed_at: null,
    error_code: null,
    error_message: null,
    error_log_ref: null,
    created_at: "2026-07-03T00:00:00.000Z",
    updated_at: "2026-07-03T00:02:00.000Z",
    ...overrides,
  };
}
