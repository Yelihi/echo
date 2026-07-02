import { describe, expect, it, jest } from "@jest/globals";

import {
  EvaluationProviderFailedError,
  EvaluationProviderInvalidResponseError,
} from "@/shared/lib/evaluation/errors";
import {
  OpenAIContextDiffProvider,
  OpenAIMemorizationExactEvaluationProvider,
  OpenAIRoleplayContextEvaluationProvider,
  OpenAIRoleplayExactEvaluationProvider,
  type OpenAIEvaluationClient,
} from "@/shared/lib/evaluation/server/OpenAIEvaluationProviders";

jest.mock("server-only", () => ({}));

describe("OpenAI evaluation providers", () => {
  it("parses semantic context diff output", async () => {
    const parse = jest.fn(async () => ({
      output_parsed: {
        diff: [{ op: "replace", expected: "would like", actual: "want" }],
      },
    }));
    const provider = new OpenAIContextDiffProvider({
      client: createClient(parse),
      model: "test-model",
    });

    await expect(
      provider.createDiff({
        practiceType: "roleplay",
        mode: "context",
        expected: { text: "I would like a window seat.", context: "At an airport counter." },
        transcript: "I want a window seat.",
      }),
    ).resolves.toEqual([{ op: "replace", expected: "would like", actual: "want" }]);
    expect(parse).toHaveBeenCalledWith(expect.objectContaining({ model: "test-model" }));
  });

  it("parses roleplay exact feedback output", async () => {
    const parse = jest.fn(async () => ({
      output_parsed: {
        feedback: "Use the exact phrase from the script.",
        score: 78,
      },
    }));
    const provider = new OpenAIRoleplayExactEvaluationProvider({
      client: createClient(parse),
      model: "test-model",
    });

    await expect(
      provider.evaluate({
        practiceType: "roleplay",
        mode: "exact",
        expected: { text: "I would like a window seat." },
        transcript: "I want a window seat.",
      }),
    ).resolves.toEqual({
      provider: "openai",
      model: "test-model",
      feedback: "Use the exact phrase from the script.",
      score: 78,
    });
  });

  it("parses roleplay context feedback output", async () => {
    const parse = jest.fn(async () => ({
      output_parsed: {
        feedback: "The learner preserved the intent in a natural way.",
      },
    }));
    const provider = new OpenAIRoleplayContextEvaluationProvider({
      client: createClient(parse),
      model: "test-model",
    });

    await expect(
      provider.evaluate({
        practiceType: "roleplay",
        mode: "context",
        expected: { text: "I would like a window seat.", context: "At an airport counter." },
        transcript: "I want a window seat.",
      }),
    ).resolves.toMatchObject({
      provider: "openai",
      model: "test-model",
      feedback: "The learner preserved the intent in a natural way.",
    });
  });

  it("parses memorization exact feedback output", async () => {
    const parse = jest.fn(async () => ({
      output_parsed: {
        feedback: "One phrase was omitted.",
        score: 64,
      },
    }));
    const provider = new OpenAIMemorizationExactEvaluationProvider({
      client: createClient(parse),
      model: "test-model",
    });

    await expect(
      provider.evaluate({
        practiceType: "memorization",
        mode: "exact",
        expected: { text: "Practice every day." },
        transcript: "Practice.",
      }),
    ).resolves.toMatchObject({
      feedback: "One phrase was omitted.",
      score: 64,
    });
  });

  it("throws an invalid response error when parsed output is null", async () => {
    const provider = new OpenAIRoleplayExactEvaluationProvider({
      client: createClient(jest.fn(async () => ({ output_parsed: null }))),
      model: "test-model",
    });

    await expect(
      provider.evaluate({
        practiceType: "roleplay",
        mode: "exact",
        expected: { text: "I would like a window seat." },
        transcript: "I want a window seat.",
      }),
    ).rejects.toBeInstanceOf(EvaluationProviderInvalidResponseError);
  });

  it("maps OpenAI failures to EvaluationProviderFailedError", async () => {
    const provider = new OpenAIRoleplayExactEvaluationProvider({
      client: createClient(
        jest.fn(async () => {
          throw new Error("provider unavailable");
        }),
      ),
      model: "test-model",
    });

    await expect(
      provider.evaluate({
        practiceType: "roleplay",
        mode: "exact",
        expected: { text: "I would like a window seat." },
        transcript: "I want a window seat.",
      }),
    ).rejects.toBeInstanceOf(EvaluationProviderFailedError);
  });
});

function createClient(parse: jest.Mock): OpenAIEvaluationClient {
  return {
    responses: {
      parse: parse as OpenAIEvaluationClient["responses"]["parse"],
    },
  };
}
