/** @jest-environment node */
import { expect, it, jest } from "@jest/globals";
import type { Supabase } from "../../../../../supabase/functions/process-analysis-job/models/repository";
import type {
  AnalysisJob,
  Target,
} from "../../../../../supabase/functions/process-analysis-job/models/types";

jest.mock("supabase-js", () => ({ createClient: jest.fn() }), { virtual: true });

it.each([true, false])(
  "기존 성공 결과 유무(%s)에 따라 현재 claim으로만 재사용한다",
  async (exists) => {
    const { reuseAnalysisResult } =
      await import("../../../../../supabase/functions/process-analysis-job/repository");
    const row = { transcript: "Hello", feedback: { reuse_key: "key" }, score: 90 };
    const query = {
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue(Promise.resolve({ data: exists ? [row] : [], error: null })),
    };
    const rpc = jest.fn().mockReturnValue(Promise.resolve({ error: null }));
    const supabase = { from: () => ({ select: () => query }), rpc } as unknown as Supabase;
    const job: AnalysisJob = {
      id: "retry",
      claim_token: "current-claim",
      user_id: "owner",
      roleplay_session_id: "session",
      memorization_session_id: null,
      evaluation_mode: "exact",
    };
    const target: Target = {
      expectedText: "Hello",
      recording: {
        roleplay_session_id: "session",
        roleplay_line_id: "line",
        memorization_session_id: null,
        memorization_sentence_id: null,
        bucket_id: "recordings",
        object_path: "audio",
        mime_type: "audio/webm",
      },
    };
    expect(await reuseAnalysisResult(supabase, job, target, "key")).toBe(exists);
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(query.eq).toHaveBeenCalledWith("roleplay_session_id", "session");
    expect(query.eq).toHaveBeenCalledWith("feedback->>reuse_key", "key");
    if (exists)
      expect(rpc).toHaveBeenCalledWith(
        "save_claimed_analysis_result",
        expect.objectContaining({
          p_job_id: "retry",
          p_claim_token: "current-claim",
          p_result: expect.objectContaining(row),
        }),
      );
    else expect(rpc).not.toHaveBeenCalled();
  },
);
