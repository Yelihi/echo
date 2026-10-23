import "server-only";
import { GrammarAudioJobRepository, prepareExampleAudio } from "@/entities/grammar-audio/server";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { getOpenAITTSModel } from "@/shared/lib/openai/server";
import type { AudioPreparation, ExampleAudioCommand } from "@/entities/grammar-audio";
import { GrammarNotePersistenceError, GrammarNoteRepository } from "@/entities/grammar-note";
import { UserProfileRepository, DEFAULT_GRAMMAR_DIFFICULTY } from "@/entities/user-profile";
import type { UserId } from "@/entities/value-object";
import { getAuthenticatedUser } from "@/shared/lib/supabase/getAuthenticatedUser";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { ExampleDependencies, ExampleResult } from "../../models/interface";
import { grammarExampleErrorCode } from "../../models/errors";
import { requestExampleOutput } from "./requestExampleOutput";
import { requestDirectReadingOutput } from "./requestDirectReadingOutput";

export async function executeExampleAction<T>(
  operation: string,
  execute: (
    dependencies: ExampleDependencies & {
      prepareAcceptedExampleAudio: (
        command: ExampleAudioCommand,
      ) => Promise<readonly AudioPreparation[]>;
    },
  ) => Promise<T>,
): Promise<ExampleResult<T>> {
  const operationId = crypto.randomUUID();
  let stage = "auth";
  async function atStage<T>(name: string, run: () => Promise<T>) {
    stage = name;
    const result = await run();
    stage = "output.validate";
    return result;
  }
  try {
    const data = await observeOperation({
      operation,
      operationId,
      getStage: () => stage,
      resourceId: "grammar-note",
      recordEvent: recordOperationEvent,

      execute: async () => {
        const supabase = await createSupabaseServerClient();
        const user = await getAuthenticatedUser(supabase);

        if (!user) throw new GrammarNotePersistenceError("UNAUTHORIZED");

        const repository = new GrammarNoteRepository(supabase);
        stage = "input.validate";
        return execute({
          repository: {
            findById: (id) => atStage("note.load", () => repository.findById(id)),
            create: (input) => atStage("note.save", () => repository.create(input)),
            update: (input) => atStage("note.save", () => repository.update(input)),
            findMany: (input) => atStage("note.load", () => repository.findMany(input)),
          },
          prepareAcceptedExampleAudio: (command) =>
            prepareExampleAudio(command, {
              createRepository: () =>
                new GrammarAudioJobRepository(
                  getSupabaseServiceRoleClient(),
                  user.id,
                  getOpenAITTSModel(),
                  process.env.PROCESS_GRAMMAR_AUDIO_SECRET,
                ),
              recordEvent: recordOperationEvent,
            }),
          generate: (...args) => atStage("ai.generate", () => requestExampleOutput(...args)),
          generateDirectReading: (...args) =>
            atStage("ai.direct-reading", () => requestDirectReadingOutput(...args)),
          loadDifficulty: () =>
            atStage(
              "profile.load",
              async () =>
                (await new UserProfileRepository(supabase).findById(user.id as UserId))
                  ?.exampleDifficulty ?? DEFAULT_GRAMMAR_DIFFICULTY,
            ),

          consumeRequest: () =>
            atStage("quota.check", async () => {
              const { data, error: quotaError } = await supabase.rpc("consume_ai_request", {
                p_operation: "analysis",
              });

              if (
                quotaError ||
                (data !== "allowed" && data !== "not_invited" && data !== "rate_limited")
              )
                throw new Error("QUOTA_FAILED", { cause: quotaError ?? undefined });

              return data;
            }),
        });
      },
    });

    return { ok: true, data };
  } catch (error) {
    const known = grammarExampleErrorCode(error);
    const code =
      known !== "FAILED"
        ? known
        : stage.startsWith("ai.")
          ? "GENERATION_FAILED"
          : stage === "output.validate"
            ? "INVALID_RESPONSE"
            : stage === "input.validate"
              ? "INVALID_INPUT"
              : "PERSISTENCE_FAILED";
    return known !== "FAILED" && known !== "INVALID_RESPONSE"
      ? { ok: false, code }
      : { ok: false, code, operationId };
  }
}
