import { describe, it, expect, beforeEach } from "@jest/globals";
import { recallSession } from "./fixture";
import {
  recallSegments,
  readRecallDraft,
  persistRecallDraft,
  answersWithRecallDraft,
} from "@/features/grammar-recall/services/recallDraft";
describe("recall drafts and semantic blanks", () => {
  beforeEach(() => sessionStorage.clear());
  it("uses stable semantic chunks without losing whitespace or punctuation", () => {
    const question = recallSession().questions[0];
    const segments = recallSegments(question);
    expect(segments.map((s) => s.text).join("")).toBe(question.sentence);
    expect(segments.filter((s) => s.hidden).map((s) => s.id)).toEqual(["verb", "contrast"]);
  });
  it("uses whole sentence recall when an example has no verified chunks", () => {
    const question = { ...recallSession().questions[0], chunks: [] };
    expect(recallSegments(question)).toEqual([
      { id: "source-whole", text: question.sentence, meaning: question.translation, hidden: true },
    ]);
  });
  it("restores unsent input on refresh but discards draft from a different saved revision", () => {
    const session = recallSession();
    const draft = { values: { contrast: "my answer" }, whole: "", assessment: null };
    persistRecallDraft(session, draft);
    expect(readRecallDraft(session)).toEqual(draft);
    expect(readRecallDraft({ ...session, version: 2 }).values).toEqual({});
  });
  it("preserves both phases and self assessment in checkpoint payload", () => {
    const session = {
      ...recallSession(),
      phase: "whole" as const,
      answers: { "partial:other": "old" },
    };
    const answers = answersWithRecallDraft(session, {
      values: { verb: "is" },
      whole: "She is a doctor.",
      assessment: "again",
    });
    expect(answers["whole:source"]).toBe("She is a doctor.");
    expect(answers["partial:other"]).toBe("old");
    expect(JSON.parse(answers["partial:source"]).assessment).toBe("again");
  });
  it("maximum_length_source_and_blank_draft_survive_refresh_and_checkpoint", () => {
    const session = recallSession();
    const sentence = "x".repeat(4000);
    session.questions[0] = { ...session.questions[0], sentence, chunks: [] };
    const draft = { values: { "source-whole": sentence }, whole: sentence, assessment: null };
    persistRecallDraft(session, draft);
    expect(readRecallDraft(session)).toEqual(draft);
    expect(
      JSON.parse(answersWithRecallDraft(session, draft)["partial:source"]).values["source-whole"],
    ).toBe(sentence);
  });
});
