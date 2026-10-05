import { describe, expect, it, jest } from "@jest/globals";
import { createGrammarExam, createGrammarExamFeedback } from "@/_tests/fixtures/grammarExam";
import type { GrammarExamProvider } from "../../models/interface";
import { createExamPrompts } from "../createExamPrompts";
import { gradeExamAnswer } from "../gradeExamAnswer";
import { requestExamFeedback } from "../requestExamFeedback";
import { grammarExamFeedbackSchema } from "../../models/schema";
import { EXAM_FEEDBACK_PROMPT } from "../../config/prompts";
function provider(): GrammarExamProvider {
  return {
    createPrompts: jest.fn<GrammarExamProvider["createPrompts"]>().mockResolvedValue({
      questions: [
        {
          context: "친구의 직업을 정정하세요.",
          instruction: "대조 구문을 사용하세요.",
          requiredWords: [{ word: "engineer", meaning: "기술자" }],
        },
      ],
    }),
    grade: jest.fn<GrammarExamProvider["grade"]>().mockResolvedValue(createGrammarExamFeedback()),
  };
}
function completed() {
  return createGrammarExam({
    status: "completed",
    completedAt: "2026-10-06T01:00:00Z",
    answers: {
      "existing:source": "She is a doctor, not a teacher.",
      "novel:novel:1": "He is not a singer but an engineer.",
    },
  });
}
describe("grammar exam operations", () => {
  it("novel_prompt_has_no_reference_sentence_and_preserves_existing_questions", async () => {
    const session = createGrammarExam();
    const original = structuredClone(session);
    const result = await createExamPrompts(session, provider());
    expect(result[0]).toMatchObject({ id: "novel:1", kind: "novel", sentence: null, chunks: [] });
    expect(session).toEqual(original);
  });
  it("malformed_prompt_is_rejected_before_persistence", async () => {
    const p = provider();
    p.createPrompts = async () => ({ questions: [] });
    await expect(createExamPrompts(createGrammarExam(), p)).rejects.toMatchObject({
      code: "FAILED",
    });
  });
  it("provider_failure_is_propagated_to_action_error_boundary", async () => {
    const p = provider();
    p.createPrompts = async () => {
      throw new Error("provider unavailable");
    };
    await expect(createExamPrompts(createGrammarExam(), p)).rejects.toThrow("provider unavailable");
  });
  it("alternate_valid_answer_is_sent_unchanged_to_rubric_without_exact_matching", async () => {
    const p = provider();
    const session = completed();
    const feedback = await gradeExamAnswer(session, "source", p);
    expect(feedback.answer).toBe("She is a doctor, not a teacher.");
    expect(feedback.verdict).toBe("correct");
    expect(p.grade).toHaveBeenCalledWith(
      expect.objectContaining({ answer: feedback.answer, targetGrammar: session.learningNote }),
    );
    expect(EXAM_FEEDBACK_PROMPT).toContain("do NOT use exact string equality");
  });
  it("active_exam_cannot_request_feedback_or_call_provider", async () => {
    const p = provider();
    await expect(gradeExamAnswer(createGrammarExam(), "source", p)).rejects.toMatchObject({
      code: "NOT_READY",
    });
    expect(p.grade).not.toHaveBeenCalled();
  });
  it("missing_question_is_rejected", async () => {
    await expect(gradeExamAnswer(completed(), "missing", provider())).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
  });
  it("malformed_grade_never_becomes_success", async () => {
    const p = provider();
    p.grade = async () => ({ verdict: "correct" });
    await expect(gradeExamAnswer(completed(), "source", p)).rejects.toMatchObject({
      code: "FAILED",
    });
  });
  it("persisted_feedback_is_reused_without_quota_or_provider", async () => {
    const feedback = createGrammarExamFeedback();
    const consumeRequest = jest.fn<() => Promise<void>>();
    const p = provider();
    const result = await requestExamFeedback("id", "source", {
      loadSession: async () => completed(),
      readFeedback: async () => feedback,
      saveFeedback: async (_, value) => value,
      consumeRequest,
      provider: p,
    });
    expect(result).toEqual(feedback);
    expect(consumeRequest).not.toHaveBeenCalled();
    expect(p.grade).not.toHaveBeenCalled();
  });
  it("quota_failure_prevents_external_call_and_persistence", async () => {
    const p = provider();
    const saveFeedback =
      jest.fn<
        (
          _: string,
          value: ReturnType<typeof createGrammarExamFeedback>,
        ) => Promise<ReturnType<typeof createGrammarExamFeedback>>
      >();
    await expect(
      requestExamFeedback("id", "source", {
        loadSession: async () => completed(),
        readFeedback: async () => null,
        saveFeedback,
        consumeRequest: async () => {
          throw new Error("quota");
        },
        provider: p,
      }),
    ).rejects.toThrow("quota");
    expect(p.grade).not.toHaveBeenCalled();
    expect(saveFeedback).not.toHaveBeenCalled();
  });
  it("failed_item_retry_keeps_original_question_and_answer", async () => {
    const session = completed();
    const p = provider();
    let attempt = 0;
    p.grade = async () => {
      if (attempt++ === 0) throw new Error("temporary");
      return createGrammarExamFeedback();
    };
    const saved = jest
      .fn<
        (
          _: string,
          value: ReturnType<typeof createGrammarExamFeedback>,
        ) => Promise<ReturnType<typeof createGrammarExamFeedback>>
      >()
      .mockImplementation(async (_, value) => value);
    const deps = {
      loadSession: async () => session,
      readFeedback: async () => null,
      saveFeedback: saved,
      consumeRequest: async () => {},
      provider: p,
    };
    await expect(requestExamFeedback("id", "source", deps)).rejects.toThrow("temporary");
    expect(saved).not.toHaveBeenCalled();
    const result = await requestExamFeedback("id", "source", deps);
    expect(result.answer).toBe(session.answers["existing:source"]);
    expect(session.questions[1].context).toBe("친구는 가수가 아니라 기술자입니다.");
  });
  it("feedback_schema_preserves_original_answer_whitespace", () => {
    const answer = "  She is a doctor.\n";
    expect(grammarExamFeedbackSchema.parse(createGrammarExamFeedback({ answer })).answer).toBe(
      answer,
    );
  });
});
