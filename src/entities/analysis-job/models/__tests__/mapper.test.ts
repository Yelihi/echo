import { describe, expect, it } from "@jest/globals";

import type {
  AnalysisJobRow,
  PracticeTargetAnalysisResultRow,
  SessionAnalysisSummaryRow,
} from "@/entities/analysis-job/models/mapper";
import {
  mapAnalysisJobRowToEntity,
  mapPracticeTargetAnalysisResultRowToEntity,
  mapSessionAnalysisSummaryRowToEntity,
} from "@/entities/analysis-job/models/mapper";
import { PracticeType } from "@/entities/practice-target";

describe("analysis job mapper", () => {
  it("역할극 analysis job row를 엔티티로 매핑한다", () => {
    const row = createAnalysisJobRow();

    const entity = mapAnalysisJobRowToEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      ownerId: row.user_id,
      sessionId: row.roleplay_session_id,
      practiceType: PracticeType.ROLEPLAY,
      state: "completed",
      provider: "openai",
      attemptNumber: 1,
      errorCode: null,
      errorMessage: null,
      errorLogRef: null,
    });
    expect(entity.queuedAt).toEqual(new Date(row.queued_at));
    expect(entity.startedAt).toEqual(new Date(row.started_at as string));
    expect(entity.completedAt).toEqual(new Date(row.completed_at as string));
    expect(entity.failedAt).toBeNull();
  });

  it("암기 analysis job row를 엔티티로 매핑한다", () => {
    const row = createAnalysisJobRow({
      roleplay_session_id: null,
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
    });

    const entity = mapAnalysisJobRowToEntity(row);

    expect(entity.practiceType).toBe(PracticeType.MEMORIZATION);
    expect(entity.sessionId).toBe(row.memorization_session_id);
  });

  it("세션 대상이 섞인 analysis job row를 거부한다", () => {
    const row = createAnalysisJobRow({
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
    });

    expect(() => mapAnalysisJobRowToEntity(row)).toThrow(
      `Invalid analysis job session target: ${row.id}`,
    );
  });

  it("practice target analysis result row를 엔티티로 매핑한다", () => {
    const row = createTargetResultRow();

    const entity = mapPracticeTargetAnalysisResultRowToEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      ownerId: row.user_id,
      analysisJobId: row.analysis_job_id,
      target: {
        practiceType: PracticeType.ROLEPLAY,
        sessionId: row.roleplay_session_id,
        lineSnapshotId: row.roleplay_line_id,
      },
      transcript: "How can I help you?",
      feedback: { fluency: "clear" },
      score: 92.5,
    });
    expect(entity.createdAt).toEqual(new Date(row.created_at));
    expect(entity.updatedAt).toEqual(new Date(row.updated_at));
  });

  it("feedback이 객체가 아닌 target result row를 거부한다", () => {
    const row = createTargetResultRow({ feedback: ["invalid"] });

    expect(() => mapPracticeTargetAnalysisResultRowToEntity(row)).toThrow(
      "Invalid practice target analysis feedback JSON object",
    );
  });

  it("session analysis summary row를 엔티티로 매핑한다", () => {
    const row = createSummaryRow();

    const entity = mapSessionAnalysisSummaryRowToEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      ownerId: row.user_id,
      analysisJobId: row.analysis_job_id,
      sessionId: row.roleplay_session_id,
      practiceType: PracticeType.ROLEPLAY,
      summary: { totalTargets: 3 },
      score: 88,
    });
    expect(entity.createdAt).toEqual(new Date(row.created_at));
    expect(entity.updatedAt).toEqual(new Date(row.updated_at));
  });
});

function createAnalysisJobRow(overrides: Partial<AnalysisJobRow> = {}): AnalysisJobRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    roleplay_session_id: "22222222-2222-4222-8222-222222222222",
    memorization_session_id: null,
    status: "completed",
    provider: "openai",
    attempt_number: 1,
    queued_at: "2026-06-13T00:00:00.000Z",
    started_at: "2026-06-13T00:01:00.000Z",
    completed_at: "2026-06-13T00:02:00.000Z",
    failed_at: null,
    error_code: null,
    error_message: null,
    error_log_ref: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:02:00.000Z",
    ...overrides,
  };
}

function createTargetResultRow(
  overrides: Partial<PracticeTargetAnalysisResultRow> = {},
): PracticeTargetAnalysisResultRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    analysis_job_id: "11111111-1111-4111-8111-111111111111",
    roleplay_session_id: "22222222-2222-4222-8222-222222222222",
    roleplay_line_id: "55555555-5555-4555-8555-555555555555",
    memorization_session_id: null,
    memorization_sentence_id: null,
    transcript: "How can I help you?",
    feedback: { fluency: "clear" },
    score: 92.5,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:02:00.000Z",
    ...overrides,
  };
}

function createSummaryRow(
  overrides: Partial<SessionAnalysisSummaryRow> = {},
): SessionAnalysisSummaryRow {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    analysis_job_id: "11111111-1111-4111-8111-111111111111",
    roleplay_session_id: "22222222-2222-4222-8222-222222222222",
    memorization_session_id: null,
    summary: { totalTargets: 3 },
    score: 88,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:02:00.000Z",
    ...overrides,
  };
}
