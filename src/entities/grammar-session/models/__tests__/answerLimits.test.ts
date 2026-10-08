import { describe, expect, it } from "@jest/globals";
import { saveGrammarAnswersSchema } from "../schema";
import { GRAMMAR_ANSWER_MAX_LENGTH, GRAMMAR_PARTIAL_DRAFT_MAX_LENGTH } from "../limits";
const id = "11111111-1111-4111-8111-111111111111";
function input(answers: Record<string, string>) {
  return { id, expectedVersion: 1, answers, phase: "partial", questionIndex: 0 };
}
describe("Grammar answer length boundary", () => {
  it("4000_character_partial_answer_includes_JSON_overhead_without_rejection", () => {
    const answer = JSON.stringify({
      values: { chunk: "x".repeat(GRAMMAR_ANSWER_MAX_LENGTH) },
      assessment: "remembered",
    });
    expect(answer.length).toBeGreaterThan(GRAMMAR_ANSWER_MAX_LENGTH);
    expect(
      saveGrammarAnswersSchema.parse(input({ "partial:source": answer })).answers["partial:source"],
    ).toBe(answer);
  });
  it.each(["whole:source", "existing:source", "novel:novel:1"])(
    "plain_%s_answer_keeps_4000_limit_and_preserves_whitespace",
    (key) => {
      const answer = " " + "x".repeat(3998) + " ";
      expect(saveGrammarAnswersSchema.parse(input({ [key]: answer })).answers[key]).toBe(answer);
      expect(saveGrammarAnswersSchema.safeParse(input({ [key]: answer + "x" })).success).toBe(
        false,
      );
    },
  );
  it("partial_serialization_limit_is_bounded_separately", () => {
    const answer = JSON.stringify({
      values: { chunk: "x".repeat(GRAMMAR_PARTIAL_DRAFT_MAX_LENGTH - 23) },
    });
    expect(answer.length).toBe(GRAMMAR_PARTIAL_DRAFT_MAX_LENGTH);
    expect(saveGrammarAnswersSchema.safeParse(input({ "partial:source": answer })).success).toBe(
      true,
    );
    expect(
      saveGrammarAnswersSchema.safeParse(input({ "partial:source": answer + " " })).success,
    ).toBe(false);
  });
});
