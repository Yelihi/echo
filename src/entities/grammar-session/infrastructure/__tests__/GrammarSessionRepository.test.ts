/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
import { GrammarSessionRepository } from "../GrammarSessionRepository";
import { mapGrammarSessionRowToEntity } from "../../models/mapper";

const id = "11111111-1111-4111-8111-111111111111";

function row(mode = "recall", status = "active") {
  return {
    id,
    note_id: id,
    note_version: 3,
    snapshot: { metadata: { title: "대조" }, source: { learningNote: "not A but B" } },
    mode,
    status,
    questions: [
      {
        id: "source",
        kind: "existing",
        sentence: "She is not a teacher but a doctor.",
        translation: "그녀는 의사입니다.",
        context: "",
        requiredWords: [],
        chunks: [{ id: "c1", start: 0, end: 3, meaning: "그녀는" }],
      },
    ],
    answers: { "partial:source": '{"c1":"She"}' },
    phase: mode === "recall" ? "partial" : "existing",
    question_index: 0,
    version: 1,
    started_at: "2026-10-06T00:00:00Z",
    completed_at: status === "completed" ? "2026-10-06T01:00:00Z" : null,
  };
}

function setup(data: unknown, status = 200) {
  const fetcher = jest.fn<typeof fetch>().mockResolvedValue(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  const client = createClient<Database>("https://echo-test.example", "key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetcher },
  });

  return { repository: new GrammarSessionRepository(client), fetcher };
}

describe("Grammar session persisted contract", () => {
  it("active_exam_hides_reference_sentence_and_chunks", () => {
    const session = mapGrammarSessionRowToEntity(row("exam"));

    expect(session.questions[0].sentence).toBeNull();
    expect(session.questions[0].chunks).toEqual([]);
    expect(session.learningNote).toBe("not A but B");
  });

  it("recall_and_completed_exam_keep_frozen_reference", () => {
    expect(mapGrammarSessionRowToEntity(row()).questions[0].sentence).toContain("teacher");
    expect(mapGrammarSessionRowToEntity(row("exam", "completed")).questions[0].sentence).toContain(
      "teacher",
    );
  });

  it("resume_retains_answer_drafts_and_order", async () => {
    const { repository } = setup(row());
    const session = await repository.findById(id);

    expect(session?.answers["partial:source"]).toBe('{"c1":"She"}');
    expect(session?.questions.map((q) => q.id)).toEqual(["source"]);
    expect(session?.noteVersion).toBe(3);
  });

  it("start_sends_only_note_identifier_and_request_intent", async () => {
    const { repository, fetcher } = setup(row());

    await repository.start({ noteId: id, requestId: id, mode: "recall" });
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({
      p_note_id: id,
      p_request_id: id,
      p_mode: "recall",
    });
  });

  it("save_sends_version_and_both_phase_drafts", async () => {
    const { repository, fetcher } = setup(row());

    await repository.saveAnswers({
      id,
      expectedVersion: 4,
      answers: { "partial:source": "{}", "whole:source": "draft" },
      phase: "whole",
      questionIndex: 0,
    });
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toMatchObject({
      p_expected_version: 4,
      p_answers: { "partial:source": "{}", "whole:source": "draft" },
    });
  });

  it.each(["CONFLICT", "UNAUTHORIZED", "INCOMPLETE", "NOT_FOUND"])(
    "database_%s_preserves_actionable_error_code",
    async (code) => {
      const { repository } = setup({ message: `GRAMMAR_SESSION_${code}` }, 400);

      await expect(repository.complete({ id, expectedVersion: 1 })).rejects.toMatchObject({ code });
    },
  );

  it("transport_failure_is_sanitized", async () => {
    const { repository, fetcher } = setup(row());

    fetcher.mockRejectedValue(new Error("secret"));
    await expect(
      repository.start({ noteId: id, requestId: id, mode: "recall" }),
    ).rejects.toMatchObject({ code: "FAILED" });
  });

  it("missing_session_is_distinct_from_transport_failure", async () => {
    const { repository } = setup(null);

    await expect(repository.findById(id)).resolves.toBeNull();
  });

  it("malformed_database_question_fails_closed", async () => {
    const { repository } = setup({ ...row(), questions: [{ id: "bad" }] });

    await expect(repository.findById(id)).rejects.toMatchObject({ code: "FAILED" });
  });

  it("history_retains_total_on_empty_page", async () => {
    const { repository } = setup({ items: [], total: 12 });

    await expect(repository.findHistory({ page: 3, pageSize: 10 })).resolves.toEqual({
      items: [],
      total: 12,
      page: 3,
      pageSize: 10,
    });
  });
});
