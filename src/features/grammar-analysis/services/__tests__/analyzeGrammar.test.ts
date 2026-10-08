import { describe, expect, it, jest } from "@jest/globals";
import { analyzeGrammar } from "../analyzeGrammar";
import { grammarAnalysisFailure } from "../../models/errors";
import type { GrammarAnalysisDependencies } from "../../models/interface";

const source = { sentence: "She is a doctor.", learningNote: "주격 보어", revision: 3 };
function createAnalysisOutput() {
  return {
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
  };
}

function dependencies(): GrammarAnalysisDependencies {
  return {
    consumeRequest: jest
      .fn<GrammarAnalysisDependencies["consumeRequest"]>()
      .mockResolvedValue("allowed"),
    provider: {
      precheck: jest
        .fn<GrammarAnalysisDependencies["provider"]["precheck"]>()
        .mockResolvedValue({ status: "passed", issues: [] }),
      analyze: jest
        .fn<GrammarAnalysisDependencies["provider"]["analyze"]>()
        .mockResolvedValue(createAnalysisOutput()),
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
    const valid = createAnalysisOutput();
    deps.provider.analyze = async () => ({
      ...valid,
      chunks: [{ id: "c", range: { start: 0, end: 999 }, literalMeaning: "뜻", explanation: "" }],
    });
    await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({ code: "INVALID_OUTPUT" });
  });
  it("does not start analysis while the precheck response is pending", async () => {
    // Given: 사전 체크가 끝나기 전에는 두 번째 요청 비용이 발생해서는 안 된다.
    const deps = dependencies();
    let resolvePrecheck!: (output: unknown) => void;
    const pendingPrecheck = new Promise<unknown>((resolve) => {
      resolvePrecheck = resolve;
    });
    let notifyStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      notifyStarted = resolve;
    });
    deps.provider.precheck = async () => {
      notifyStarted();
      return pendingPrecheck;
    };

    // When
    const result = analyzeGrammar(source, deps);
    await started;

    // Then
    expect(deps.consumeRequest).toHaveBeenCalledTimes(1);
    expect(deps.provider.analyze).not.toHaveBeenCalled();
    resolvePrecheck({ status: "passed", issues: [] });
    await expect(result).resolves.toMatchObject({ status: "analyzed" });
    expect(deps.consumeRequest).toHaveBeenCalledTimes(2);
  });

  it.each([
    { status: "needs-revision", issues: [{ field: "sentence", message: " ", suggestion: null }] },
    { status: "uncertain", issues: [{ field: "sentence", message: "보완 필요", suggestion: " " }] },
    { status: "passed", issues: [], sourceRevision: 999 },
  ])("rejects invalid precheck content before charging for analysis: %j", async (output) => {
    // Given
    const deps = dependencies();
    deps.provider.precheck = async () => output;
    // When / Then
    await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({ code: "INVALID_OUTPUT" });
    expect(deps.consumeRequest).toHaveBeenCalledTimes(1);
    expect(deps.provider.analyze).not.toHaveBeenCalled();
  });

  it.each([null, { title: "incomplete" }])("rejects malformed analysis DTO: %j", async (output) => {
    // Given
    const deps = dependencies();
    deps.provider.analyze = async () => output;
    // When / Then
    await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({ code: "INVALID_OUTPUT" });
  });

  it.each([
    { title: " " },
    { tags: [" "] },
    { sourceText: "A different sentence." },
    { sourceRevision: 999 },
    { reviewStatus: "reviewed" },
  ])("rejects invalid metadata or AI attempts to set server-owned fields: %j", async (override) => {
    // Given: 유효한 기본 응답에서 검증 대상 필드만 교체한다.
    const deps = dependencies();
    const valid = createAnalysisOutput();
    deps.provider.analyze = async () => ({ ...valid, ...override });
    // When / Then
    await expect(analyzeGrammar(source, deps)).rejects.toMatchObject({ code: "INVALID_OUTPUT" });
  });

  it.each(["precheck", "analyze"] as const)(
    "propagates %s rejection to the safe error boundary",
    async (stage) => {
      // Given
      const deps = dependencies();
      const failure = new Error("sensitive provider contents");
      deps.provider[stage] = jest
        .fn<GrammarAnalysisDependencies["provider"][typeof stage]>()
        .mockRejectedValue(failure);
      // When / Then: 중간 단계에서 삼키거나 원문을 UI 메시지에 포함하지 않는다.
      await expect(analyzeGrammar(source, deps)).rejects.toBe(failure);
      expect(grammarAnalysisFailure(failure)).toMatchObject({
        status: "error",
        code: "PROVIDER_FAILED",
      });
      expect(grammarAnalysisFailure(failure).message).not.toContain(failure.message);
      expect(deps.consumeRequest).toHaveBeenCalledTimes(stage === "precheck" ? 1 : 2);
      if (stage === "precheck") expect(deps.provider.analyze).not.toHaveBeenCalled();
    },
  );

  it("stops before any provider call when the quota service rejects", async () => {
    // Given
    const deps = dependencies();
    const failure = new Error("quota unavailable");
    deps.consumeRequest = jest
      .fn<GrammarAnalysisDependencies["consumeRequest"]>()
      .mockRejectedValue(failure);
    // When / Then
    await expect(analyzeGrammar(source, deps)).rejects.toBe(failure);
    expect(deps.provider.precheck).not.toHaveBeenCalled();
    expect(deps.provider.analyze).not.toHaveBeenCalled();
  });
  it("maps provider exceptions to safe display messages without raw text", () => {
    const result = grammarAnalysisFailure(new Error("sensitive request contents"));
    expect(result.code).toBe("PROVIDER_FAILED");
    expect(result.message).not.toContain("sensitive");
  });
});
