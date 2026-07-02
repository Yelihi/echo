import "server-only";

import { getOpenAIEvaluationModel, getOpenAIServerClient } from "@/shared/lib/openai/server";
import { EvaluationResultService } from "@/shared/lib/evaluation/server/EvaluationResultService";
import { ExactDiffProvider } from "@/shared/lib/evaluation/server/ExactDiffProvider";
import {
  OpenAIContextDiffProvider,
  OpenAIMemorizationExactEvaluationProvider,
  OpenAIRoleplayContextEvaluationProvider,
  OpenAIRoleplayExactEvaluationProvider,
  type OpenAIEvaluationClient,
} from "@/shared/lib/evaluation/server/OpenAIEvaluationProviders";
import { StaticEvaluationProviderRegistry } from "@/shared/lib/evaluation/server/StaticEvaluationProviderRegistry";

export interface CreateEvaluationResultServiceOptions {
  readonly client?: OpenAIEvaluationClient;
  readonly model?: string;
}

export function createEvaluationResultService(
  options: CreateEvaluationResultServiceOptions = {},
): EvaluationResultService {
  const client = options.client ?? getOpenAIServerClient();
  const model = options.model ?? getOpenAIEvaluationModel();
  const exactDiffProvider = new ExactDiffProvider();
  const contextDiffProvider = new OpenAIContextDiffProvider({ client, model });

  return new EvaluationResultService(
    new StaticEvaluationProviderRegistry([
      {
        practiceType: "roleplay",
        mode: "exact",
        entry: {
          diffProvider: exactDiffProvider,
          evaluationProvider: new OpenAIRoleplayExactEvaluationProvider({ client, model }),
        },
      },
      {
        practiceType: "roleplay",
        mode: "context",
        entry: {
          diffProvider: contextDiffProvider,
          evaluationProvider: new OpenAIRoleplayContextEvaluationProvider({ client, model }),
        },
      },
      {
        practiceType: "memorization",
        mode: "exact",
        entry: {
          diffProvider: exactDiffProvider,
          evaluationProvider: new OpenAIMemorizationExactEvaluationProvider({ client, model }),
        },
      },
    ]),
  );
}
