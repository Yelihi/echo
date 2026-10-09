/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import OpenAI from "openai";

jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/openai/server", () => ({
  getOpenAIServerClient: jest.fn(),
  getOpenAIEvaluationModel: () => "test-model",
}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(output: unknown, status = "completed") {
  const requests: Request[] = [];
  const client = new OpenAI({
    apiKey: "test-key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return new Response(
        JSON.stringify({
          id: "resp_test",
          status,
          output:
            output === null
              ? []
              : [
                  {
                    type: "message",
                    id: "msg_test",
                    role: "assistant",
                    status: "completed",
                    content: [
                      { type: "output_text", text: JSON.stringify(output), annotations: [] },
                    ],
                  },
                ],
        }),
        { headers: { "content-type": "application/json" } },
      );
    },
  });
  const { getOpenAIServerClient } = await import("@/shared/lib/openai/server");
  jest.mocked(getOpenAIServerClient).mockReturnValue(client);
  const { createOpenAIGrammarProvider } = await import("../server/openAIGrammarProvider");
  return { provider: createOpenAIGrammarProvider(), requests };
}

const source = {
  sentence: "I want to join a study group",
  learningNote: "I want to : ~하고 싶어",
  revision: 87,
};

// 2026-10-09 공급자 재검증에서 확인한 구간을 사용한다. 번역 문구는 테스트용이다.
function output() {
  return {
    title: "want to + 동사원형",
    tags: ["to부정사"],
    grammarKey: null,
    chunks: [
      { id: "c1", range: { start: 0, end: 2 }, literalMeaning: "나는", explanation: "주어" },
      { id: "c2", range: { start: 2, end: 10 }, literalMeaning: "~하고 싶다", explanation: "희망" },
      {
        id: "c3",
        range: { start: 10, end: 28 },
        literalMeaning: "스터디 그룹에 가입하다",
        explanation: "행동",
      },
    ],
    syntax: [
      {
        id: "s1",
        ranges: [{ start: 0, end: 2 }],
        parentId: null,
        role: "subject",
        label: "주어",
        explanation: "",
      },
    ],
    constructions: [],
    naturalTranslation: "나는 스터디 그룹에 가입하고 싶다.",
  };
}

describe("OpenAI grammar response boundary", () => {
  it("supplies exact source positions and constrains null identifiers while accepting valid output", async () => {
    // Given: SDK와 JSON schema를 그대로 사용하고 네트워크만 대체한다.
    const { provider, requests } = await setup(output());
    const { generateGrammarAnalysis } = await import("../generateGrammarAnalysis");

    // When
    const result = await generateGrammarAnalysis(source, {
      provider,
      consumeRequest: async () => "allowed",
    });
    const request = await requests[0].json();
    const input = JSON.parse(request.input[1].content);

    // Then
    expect(result.analysis).toMatchObject({
      sourceText: source.sentence,
      sourceRevision: 87,
      reviewStatus: "needs-review",
    });
    expect(input.sentenceLength).toBe(28);
    expect(input.sourceSpans).toEqual([
      { text: "I ", start: 0, end: 2 },
      { text: "want ", start: 2, end: 7 },
      { text: "to ", start: 7, end: 10 },
      { text: "join ", start: 10, end: 15 },
      { text: "a ", start: 15, end: 17 },
      { text: "study ", start: 17, end: 23 },
      { text: "group", start: 23, end: 28 },
    ]);
    expect(request.text.format.schema.properties.grammarKey).toEqual({ type: "null" });
    expect(request.text.format.schema.properties.syntax.items.properties.parentId).toMatchObject({
      anyOf: expect.arrayContaining([{ type: "string", minLength: 1 }, { type: "null" }]),
    });
    expect(requests).toHaveLength(1);
  });

  it("preserves whitespace and UTF-16 boundaries in the supplied source guide", async () => {
    const { provider, requests } = await setup(output());
    await provider.analyze({ ...source, sentence: "  I\tlike  🎵.\n" });
    const request = await requests[0].json();
    const input = JSON.parse(request.input[1].content);

    expect(input.sentenceLength).toBe(14);
    expect(input.sourceSpans).toEqual([
      { text: "  I\t", start: 0, end: 4 },
      { text: "like  ", start: 4, end: 10 },
      { text: "🎵.\n", start: 10, end: 14 },
    ]);
  });

  it.each(["precheck", "analyze"] as const)(
    "classifies empty %s responses without retrying",
    async (method) => {
      const { provider, requests } = await setup(null);
      await expect(provider[method](source)).rejects.toMatchObject({
        code: "INVALID_OUTPUT",
        diagnostics: {
          stage: method === "precheck" ? "precheck.response" : "analysis.response",
          issues: [{ code: "empty_output", path: [] }],
        },
      });
      expect(requests).toHaveLength(1);
    },
  );

  it("rejects incomplete responses even when parsed content exists", async () => {
    const { provider, requests } = await setup(output(), "incomplete");
    await expect(provider.analyze(source)).rejects.toMatchObject({
      diagnostics: {
        stage: "analysis.response",
        issues: [{ code: "incomplete_response", path: [] }],
      },
    });
    expect(requests).toHaveLength(1);
  });

  it("classifies SDK schema failures without exposing generated text", async () => {
    const { provider, requests } = await setup({
      ...output(),
      grammarKey: "private invalid value",
    });
    await expect(provider.analyze(source)).rejects.toMatchObject({
      diagnostics: {
        stage: "analysis.shape",
        issues: [{ code: "invalid_type", path: ["grammarKey"] }],
      },
    });
    expect(requests).toHaveLength(1);
  });

  it("records the validation stage on the same failed operation and returns only a safe UI error", async () => {
    await setup({
      status: "passed",
      issues: [{ field: "sentence", message: "private text", suggestion: null }],
    });
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
    const { recordOperationEvent } = await import("@/shared/lib/logging/pino");
    // 인증·quota는 외부 경계이며 도메인 검증과 operation observer는 실제 구현을 사용한다.
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "test-user" } }, error: null }) },
      rpc: async () => ({ data: "allowed", error: null }),
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    const { requestGrammarAnalysis } = await import("../actions/requestGrammarAnalysis");

    const result = await requestGrammarAnalysis(source);
    const calls = jest.mocked(recordOperationEvent).mock.calls;
    expect(result).toMatchObject({ status: "error", code: "INVALID_OUTPUT" });
    expect(result).not.toHaveProperty("diagnostics");
    expect(calls[1]).toEqual([
      expect.objectContaining({ phase: "failed", operationId: calls[0][0].operationId }),
      { stage: "precheck.consistency", issues: [{ code: "unexpected_issues", path: ["issues"] }] },
    ]);
    expect(JSON.stringify(calls)).not.toContain("private text");
    expect(JSON.stringify(calls)).not.toContain(source.sentence);
  });
});
