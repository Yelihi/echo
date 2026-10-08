import type { ExampleErrorCode } from "./errors";
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
export type ExampleResult<T> = { ok: true; data: T } | { ok: false; code: ExampleErrorCode };
export interface ExampleDependencies {
  repository: GrammarNoteRepositoryPort;
  generate: (note: GrammarNote, count: 1 | 3) => Promise<unknown>;
  consumeRequest: () => Promise<"allowed" | "not_invited" | "rate_limited">;
}
export interface GrammarExampleManagerProps {
  note: GrammarNote;
  generate: (command: GenerateExamplesCommand) => Promise<ExampleResult<readonly GrammarExample[]>>;
  save: (command: SaveExamplesCommand) => Promise<ExampleResult<GrammarNote>>;
  onUpdated: (note: GrammarNote) => void;
  onBack?: () => void;
}
export interface ExampleState {
  note: GrammarNote;
  candidates: readonly GrammarExample[];
  selected: readonly string[];
  pending: string | null;
  error: ExampleErrorCode | null;
  dirty: boolean;
  change: (
    id: string,
    field: "sentence" | "translation" | "targetExplanation",
    value: string,
  ) => void;
  select: (id: string, selected: boolean) => void;
  generate: (id?: string) => Promise<void>;
  save: () => Promise<void>;
  cancel: () => void;
  discard: () => void;
}
