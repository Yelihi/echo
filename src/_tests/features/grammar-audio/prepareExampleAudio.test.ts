/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";
import type { GrammarAudioJobRepositoryPort } from "@/entities/grammar-audio";
import { prepareExampleAudio } from "@/entities/grammar-audio/services/prepareExampleAudio";
import type { RecordOperationEvent } from "@/shared/lib/logging/models";

const command = { noteId: "note", sentenceIds: ["example"] };
function dependencies() {
  const repository = {
    enqueueExampleAudio: jest.fn<GrammarAudioJobRepositoryPort["enqueueExampleAudio"]>(),
    getPreparation: jest.fn<GrammarAudioJobRepositoryPort["getPreparation"]>(),
    requestProcessing: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
  return {
    repository,
    createRepository: () => repository,
    recordEvent: jest.fn<RecordOperationEvent>(),
  };
}

describe("audio preparation policy", () => {
  it("preparation: ready assets skip processing and explicit retry is forwarded", async () => {
    const deps = dependencies();
    const ready = [{ sentenceId: "example", status: "ready" as const }];
    deps.repository.enqueueExampleAudio.mockResolvedValue(ready);
    expect(await prepareExampleAudio(command, deps, true)).toEqual(ready);
    expect(deps.repository.enqueueExampleAudio).toHaveBeenCalledWith(command, true);
    expect(deps.repository.requestProcessing).not.toHaveBeenCalled();
  });

  it("preparation: invocation failure preserves every durable job and correlates safe logs", async () => {
    const deps = dependencies();
    const queued = { sentenceId: "example", status: "queued" as const, jobId: "job" };
    const ready = { sentenceId: "other", status: "ready" as const };
    deps.repository.enqueueExampleAudio.mockResolvedValue([queued, ready]);
    deps.repository.requestProcessing.mockRejectedValue(new Error("private worker detail"));
    const result = await prepareExampleAudio(command, deps);
    expect(result).toEqual([
      { ...queued, code: "PROCESSOR_UNAVAILABLE", operationId: expect.any(String) },
      ready,
    ]);
    expect(deps.repository.enqueueExampleAudio).toHaveBeenCalledTimes(1);
    expect(deps.repository.enqueueExampleAudio).toHaveBeenCalledWith(command, false);
    expect(deps.repository.requestProcessing).toHaveBeenCalledTimes(1);
    expect(deps.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "failed",
        stage: "worker.invoke",
        operationId: result[0].operationId,
      }),
    );
    expect(JSON.stringify(deps.recordEvent.mock.calls)).not.toContain("private worker detail");
  });

  it.each(["creation", "enqueue"])(
    "preparation: %s failure remains retryable without losing a saved note",
    async (stage) => {
      const deps = dependencies();
      if (stage === "creation")
        deps.createRepository = () => {
          throw new Error("configuration unavailable");
        };
      else
        deps.repository.enqueueExampleAudio.mockRejectedValue(
          new Error("registration unavailable"),
        );
      const result = await prepareExampleAudio(command, deps);
      expect(result).toEqual([
        {
          sentenceId: "example",
          status: "retryable",
          code: "REGISTRATION_FAILED",
          operationId: expect.any(String),
        },
      ]);
      expect(deps.repository.requestProcessing).not.toHaveBeenCalled();
      expect(deps.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: "failed",
          stage: "audio.register",
          operationId: result[0].operationId,
        }),
      );
    },
  );
});
