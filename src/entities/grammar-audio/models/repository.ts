export interface AudioPreparation {
  sentenceId: string;
  jobId?: string;
  revision?: string;
  status: "missing" | "queued" | "processing" | "ready" | "retryable";
  code?: string;
  operationId?: string;
}

export interface ExampleAudioCommand {
  noteId: string;
  sentenceIds: readonly string[];
}

export type AudioPreparationResult =
  | { ok: true; data: readonly AudioPreparation[] }
  | { ok: false; code: "INVALID_INPUT" | "UNAUTHORIZED" | "FAILED"; operationId?: string };

export interface GrammarAudioJobRepositoryPort {
  enqueueExampleAudio(
    command: ExampleAudioCommand,
    retry?: boolean,
  ): Promise<readonly AudioPreparation[]>;
  getPreparation(command: ExampleAudioCommand): Promise<readonly AudioPreparation[]>;
}
