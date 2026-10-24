import { observeOperation } from "@/shared/lib/logging/observeOperation";
import type { RecordOperationEvent } from "@/shared/lib/logging/models";
import type {
  AudioPreparation,
  ExampleAudioCommand,
  GrammarAudioJobRepositoryPort,
} from "../models/repository";

export async function prepareExampleAudio(
  command: ExampleAudioCommand,
  dependencies: {
    createRepository: () => GrammarAudioJobRepositoryPort;
    recordEvent: RecordOperationEvent;
  },
  retry = false,
): Promise<readonly AudioPreparation[]> {
  const operationId = crypto.randomUUID();
  let stage = "audio.register";
  let registered: readonly AudioPreparation[] | undefined;
  try {
    return await observeOperation({
      operation: "grammar.audio.prepare",
      resourceId: command.noteId,
      operationId,
      getStage: () => stage,
      recordEvent: dependencies.recordEvent,
      execute: async () => {
        const repository = dependencies.createRepository();
        registered = await repository.enqueueExampleAudio(command, retry);
        if (registered.some((item) => item.status === "queued")) {
          stage = "worker.invoke";
          await repository.requestProcessing();
        }
        return registered;
      },
    });
  } catch {
    return registered
      ? registered.map((item) =>
          item.status === "queued" ? { ...item, code: "PROCESSOR_UNAVAILABLE", operationId } : item,
        )
      : command.sentenceIds.map((sentenceId) => ({
          sentenceId,
          status: "retryable",
          code: "REGISTRATION_FAILED",
          operationId,
        }));
  }
}
