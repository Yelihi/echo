import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import {
  EvaluationProviderFailedError,
  EvaluationProviderInvalidResponseError,
} from "@/shared/lib/evaluation/errors";
import {
  evaluationDiffOutputSchema,
  evaluationFeedbackResultSchema,
  openAIEvaluationDiffOutputSchema,
  openAIEvaluationFeedbackResultSchema,
  type OpenAIEvaluationDiffOutputSchema,
  type OpenAIEvaluationFeedbackResultSchema,
} from "@/shared/lib/evaluation/schema";
import type {
  DiffProvider,
  DiffProviderInput,
  EvaluationDiffSegment,
  EvaluationFeedbackResult,
  EvaluationProvider,
  EvaluationProviderInput,
} from "@/shared/lib/evaluation/types";

export interface OpenAIEvaluationClient {
  readonly responses: {
    parse(body: unknown): Promise<OpenAIParsedResponse>;
  };
}

interface OpenAIParsedResponse {
  readonly output_parsed: unknown;
}

interface OpenAIProviderOptions {
  readonly client: OpenAIEvaluationClient;
  readonly model: string;
}

type EvaluationPromptKind = "roleplay-exact" | "roleplay-context" | "memorization-exact";

export class OpenAIContextDiffProvider implements DiffProvider {
  private readonly client: OpenAIEvaluationClient;
  private readonly model: string;

  constructor({ client, model }: OpenAIProviderOptions) {
    this.client = client;
    this.model = model;
  }

  async createDiff(input: DiffProviderInput): Promise<ReadonlyArray<EvaluationDiffSegment>> {
    const parsed = await parseOpenAIOutput<OpenAIEvaluationDiffOutputSchema>(() =>
      this.client.responses.parse({
        model: this.model,
        input: [
          {
            role: "system",
            content:
              "Create a phrase-like semantic diff for English speaking practice. Return only schema-valid output.",
          },
          {
            role: "user",
            content: buildEvaluationPrompt(input),
          },
        ],
        text: {
          format: zodTextFormat(openAIEvaluationDiffOutputSchema, "evaluation_semantic_diff"),
        },
      }),
    );

    return evaluationDiffOutputSchema.parse({
      diff: parsed.diff.map((segment) => ({
        op: segment.op,
        expected: segment.expected ?? undefined,
        actual: segment.actual ?? undefined,
      })),
    }).diff;
  }
}

abstract class OpenAIEvaluationProviderBase implements EvaluationProvider {
  private readonly client: OpenAIEvaluationClient;
  private readonly model: string;
  private readonly kind: EvaluationPromptKind;

  protected constructor({ client, model }: OpenAIProviderOptions, kind: EvaluationPromptKind) {
    this.client = client;
    this.model = model;
    this.kind = kind;
  }

  async evaluate(input: EvaluationProviderInput): Promise<EvaluationFeedbackResult> {
    const parsed = await parseOpenAIOutput<OpenAIEvaluationFeedbackResultSchema>(() =>
      this.client.responses.parse({
        model: this.model,
        input: [
          {
            role: "system",
            content: getSystemPrompt(this.kind),
          },
          {
            role: "user",
            content: buildEvaluationPrompt(input),
          },
        ],
        text: {
          format: zodTextFormat(openAIEvaluationFeedbackResultSchema, "evaluation_feedback"),
        },
      }),
    );
    const feedback = evaluationFeedbackResultSchema.parse({
      feedback: parsed.feedback,
      score: parsed.score ?? undefined,
    });

    return {
      provider: "openai",
      model: this.model,
      feedback: feedback.feedback,
      score: feedback.score,
    };
  }
}

export class OpenAIRoleplayExactEvaluationProvider extends OpenAIEvaluationProviderBase {
  constructor(options: OpenAIProviderOptions) {
    super(options, "roleplay-exact");
  }
}

export class OpenAIRoleplayContextEvaluationProvider extends OpenAIEvaluationProviderBase {
  constructor(options: OpenAIProviderOptions) {
    super(options, "roleplay-context");
  }
}

export class OpenAIMemorizationExactEvaluationProvider extends OpenAIEvaluationProviderBase {
  constructor(options: OpenAIProviderOptions) {
    super(options, "memorization-exact");
  }
}

async function parseOpenAIOutput<T>(request: () => Promise<OpenAIParsedResponse>): Promise<T> {
  try {
    const response = await request();

    if (!response.output_parsed) {
      throw new EvaluationProviderInvalidResponseError();
    }

    return response.output_parsed as T;
  } catch (error) {
    if (error instanceof EvaluationProviderInvalidResponseError) {
      throw error;
    }

    throw new EvaluationProviderFailedError({ cause: error });
  }
}

function getSystemPrompt(kind: EvaluationPromptKind): string {
  switch (kind) {
    case "roleplay-exact":
      return "Evaluate exact roleplay line recall. Focus on deviations from the expected script.";
    case "roleplay-context":
      return "Evaluate roleplay intent and situational appropriateness. Allow natural paraphrases.";
    case "memorization-exact":
      return "Evaluate exact memorization recall. Focus on omitted, inserted, or replaced phrases.";
  }
}

function buildEvaluationPrompt(input: EvaluationProviderInput | DiffProviderInput): string {
  return [
    `Practice type: ${input.practiceType}`,
    `Evaluation mode: ${input.mode}`,
    input.expected.context ? `Context: ${input.expected.context}` : null,
    `Expected: ${input.expected.text}`,
    `Transcript: ${input.transcript}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}
