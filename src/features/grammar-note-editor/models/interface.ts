import type { ComponentType } from "react";
import type {
  GrammarMetadata,
  GrammarNote,
  GrammarNoteContent,
  GrammarSource,
  PrecheckResult,
  SentenceAnalysis,
} from "@/entities/grammar-note";

export type EditorAnalysisResult =
  | { status: "analyzed"; data: { metadata: GrammarMetadata; analysis: SentenceAnalysis } }
  | { status: "needs-input"; precheck: Exclude<PrecheckResult, { status: "passed" }> }
  | { status: "error"; message: string };
export type SaveNoteCommand = {
  requestId: string;
  content: GrammarNoteContent;
  existing?: { id: string; expectedVersion: number };
};
export type SaveNoteResult = { ok: true; note: GrammarNote } | { ok: false; message: string };
export interface GrammarNoteEditorProps {
  initialNote?: GrammarNote;
  analyze: (source: GrammarSource) => Promise<EditorAnalysisResult>;
  save: (command: SaveNoteCommand) => Promise<SaveNoteResult>;
  AnalysisEditor: ComponentType<{
    initialAnalysis: SentenceAnalysis;
    onChange: (analysis: SentenceAnalysis) => void;
  }>;
  onSaved: (note: GrammarNote) => void;
  onExit: () => void;
}
export interface EditorState {
  source: GrammarSource;
  result: EditorAnalysisResult | null;
  stage: "input" | "review";
  pending: "analysis" | "save" | null;
  error: string;
  fieldErrors: Partial<Record<"sentence" | "learningNote", string>>;
  reviewed: boolean;
  dirty: boolean;
  changeSource: (field: "sentence" | "learningNote", value: string) => void;
  changeAnalysis: (analysis: SentenceAnalysis) => void;
  markDirty: () => void;
  setReviewed: (reviewed: boolean) => void;
  back: () => void;
  analyze: () => Promise<void>;
  save: () => Promise<void>;
  cancel: () => void;
}
