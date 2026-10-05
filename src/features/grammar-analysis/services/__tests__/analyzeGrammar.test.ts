import { describe, expect, it, jest } from "@jest/globals";
import { analyzeGrammar } from "../analyzeGrammar";
import { grammarAnalysisFailure } from "../../models/errors";
import type { GrammarAnalysisDependencies } from "../../models/interface";

const source = { sentence: "She is a doctor.", learningNote: "주격 보어", revision: 3 };
function dependencies(): GrammarAnalysisDependencies {
  return {
    consumeRequest: jest
      .fn<GrammarAnalysisDependencies["consumeRequest"]>()
      .mockResolvedValue("allowed"),
    provider: {
      precheck: jest
        .fn<GrammarAnalysisDependencies["provider"]["precheck"]>()
        .mockResolvedValue({ status: "passed", issues: [] }),
      analyze: jest.fn<GrammarAnalysisDependencies["provider"]["analyze"]>().mockResolvedValue({
        title: "주격 보어",
        tags: ["보어"],
        grammarKey: null,
        chunks: [
          {
            id: "c",
            range: { start: 0, end: 16 },
            literalMeaning: "그녀는 의사이다",
            explanation: "",
          },
        ],
        syntax: [],
        constructions: [],
        naturalTranslation: "그녀는 의사입니다.",
      }),
    },
  };
}

describe("grammar precheck followed by analysis", () => {
  it("validates both inputs before consuming quota", async () => {
    const deps = dependencies();
    await expect(analyzeGrammar({ ...source, learningNote: " " }, deps)).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
    expect(deps.consumeRequest).not.toHaveBeenCalled();
  });
  it.each(["needs-revision", "uncertain"])(
    "returns %s issues without generating analysis",
    async (status) => {
      const deps = dependencies();
      deps.provider.precheck = jest
        .fn<GrammarAnalysisDependencies["provider"]["precheck"]>()
        .mockResolvedValue({
          status,
          issues: [{ field: "learningNote", message: "설명을 보완해 주세요.", suggestion: null }],
        });
      const result = await analyzeGrammar(source, deps);
      expect(result).toMatchObject({
        status: "needs-input",
        precheck: { status, sourceRevision: 3 },
      });
      expect(deps.provider.analyze).not.toHaveBeenCalled();
      expect(deps.consumeRequest).toHaveBeenCalledTimes(1);
    },
  );
  it("stamps original text/revision and requires user review after both charged requests", async () => {
    const deps = dependencies();
    const result = await analyzeGrammar(source, deps);
    expect(result).toMatchObject({
      status: "analyzed",
      data: {
        analysis: { sourceText: source.sentence, sourceRevision: 3, reviewStatus: "needs-review" },
        metadata: { source: "ai", sourceRevision: 3 },
      },
    });
    expect(deps.consumeRequest).toHaveBeenCalledTimes(2);
  });
  it.each(["not_invited", "rate_limited"] as const)(
    "blocks provider calls for %s",
    async (permission) => {
      const deps = dependencies();
      deps.consumeRequest = jest
        .fn<GrammarAnalysisDependencies["consumeRequest"]>()
        .mockResolvedValue(permission);
      await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({
        code: permission === "not_invited" ? "NOT_INVITED" : "RATE_LIMITED",
      });
      expect(deps.provider.precheck).not.toHaveBeenCalled();
      expect(deps.provider.analyze).not.toHaveBeenCalled();
    },
  );
  it("rechecks quota before the second provider call", async () => {
    const deps = dependencies();
    deps.consumeRequest = jest
      .fn<GrammarAnalysisDependencies["consumeRequest"]>()
      .mockResolvedValueOnce("allowed")
      .mockResolvedValueOnce("rate_limited");
    await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(deps.provider.analyze).not.toHaveBeenCalled();
  });
  it.each([
    null,
    { status: "passed", issues: [{ field: "sentence", message: "문제", suggestion: null }] },
    { status: "uncertain", issues: [] },
  ])("rejects malformed or contradictory precheck %j", async (output) => {
    const deps = dependencies();
    deps.provider.precheck = async () => output;
    await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({ code: "INVALID_OUTPUT" });
    expect(deps.provider.analyze).not.toHaveBeenCalled();
  });
  it("rejects invalid source ranges from AI", async () => {
    const deps = dependencies();
    const valid = await deps.provider.analyze(source);
    deps.provider.analyze = async () => ({
      ...(valid as object),
      chunks: [{ id: "c", range: { start: 0, end: 999 }, literalMeaning: "뜻", explanation: "" }],
    });
    await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({ code: "INVALID_OUTPUT" });
  });
  it("maps provider exceptions to safe display messages without raw text", () => {
    const result = grammarAnalysisFailure(new Error("sensitive request contents"));
    expect(result.code).toBe("PROVIDER_FAILED");
    expect(result.message).not.toContain("sensitive");
  });
});
