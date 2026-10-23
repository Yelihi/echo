import type {
  AudioPreparation,
  AudioPreparationResult,
  ExampleAudioCommand,
} from "@/entities/grammar-audio";
import type { ExampleErrorCode } from "./errors";
import type { GrammarDifficulty } from "@/entities/user-profile";
import type {
  GrammarExample,
  GrammarNote,
  GrammarNoteRepositoryPort,
} from "@/entities/grammar-note";

export interface GenerateExamplesCommand {
  noteId: string;
  expectedVersion: number;
  count: 1 | 3;
}

export interface SaveExamplesCommand {
  noteId: string;
  expectedVersion: number;
  candidates: readonly GrammarExample[];
}

export interface RegenerateDirectReadingCommand {
  noteId: string;
  expectedVersion: number;
  sentence: string;
}

export type DirectReading = NonNullable<GrammarExample["directReading"]>;

export type ExampleResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ExampleErrorCode; operationId?: string };

export type SaveExamplesResult =
  | { ok: true; data: GrammarNote; audioPreparation: readonly AudioPreparation[] }
  | { ok: false; code: ExampleErrorCode; operationId?: string };

export interface ExampleDependencies {
  repository: GrammarNoteRepositoryPort;
  generate: (note: GrammarNote, count: 1 | 3, difficulty: GrammarDifficulty) => Promise<unknown>;
  generateDirectReading: (note: GrammarNote, sentence: string) => Promise<unknown>;
  loadDifficulty: () => Promise<GrammarDifficulty>;
  consumeRequest: () => Promise<"allowed" | "not_invited" | "rate_limited">;
}

export interface GrammarExampleManagerProps {
  note: GrammarNote;
  generate: (command: GenerateExamplesCommand) => Promise<ExampleResult<readonly GrammarExample[]>>;
  regenerateDirectReading: (
    command: RegenerateDirectReadingCommand,
  ) => Promise<ExampleResult<DirectReading>>;
  save: (command: SaveExamplesCommand) => Promise<SaveExamplesResult>;
  readAudioPreparation?: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  retryAudioPreparation?: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  onUpdated: (note: GrammarNote) => void;
  onBack?: () => void;
}

export interface ExampleState {
  audioPreparation: readonly AudioPreparation[];
  note: GrammarNote;
  candidates: readonly GrammarExample[];
  editing: Readonly<Record<string, GrammarExample>>;
  selected: readonly string[];
  pending: string | null;
  error: ExampleErrorCode | null;
  dirty: boolean;
  startEdit: (id: string) => void;
  cancelEdit: (id: string) => void;
  finishEdit: (id: string) => void;
  change: (
    id: string,
    field: "sentence" | "translation" | "targetExplanation",
    value: string,
  ) => void;
  select: (id: string, selected: boolean) => void;
  generate: (id?: string) => Promise<void>;
  regenerateDirectReading: (id: string) => Promise<void>;
  save: () => Promise<void>;
  cancel: () => void;
  discard: () => void;
}
