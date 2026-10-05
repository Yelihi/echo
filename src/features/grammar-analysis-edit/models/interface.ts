import type { ReactNode } from "react";
import type {
  ConstructionAnnotation,
  SentenceAnalysis,
  SyntaxAnnotation,
} from "@/entities/grammar-note";

export type AnalysisEdit =
  | { type: "move-boundary"; chunkId: string; end: number }
  | { type: "split-chunk"; chunkId: string; offset: number; newId: string }
  | { type: "merge-next"; chunkId: string }
  | { type: "edit-chunk"; chunkId: string; literalMeaning: string; explanation: string }
  | { type: "save-syntax"; annotation: SyntaxAnnotation }
  | { type: "delete-syntax"; id: string }
  | { type: "save-construction"; annotation: ConstructionAnnotation }
  | { type: "delete-construction"; id: string };

export type AnalysisEditResult =
  | { ok: true; analysis: SentenceAnalysis }
  | { ok: false; message: string };

export interface AnalysisEditorState {
  readonly analysis: SentenceAnalysis;
  readonly selectedId: string | null;
  readonly editing: boolean;
  readonly dirty: boolean;
  readonly pendingSelection: { id: string | null } | null;
  startEditing: () => void;
  markDirty: () => void;
  resolveSelection: (discard: boolean) => void;
  select: (id: string | null) => void;
  edit: (edit: AnalysisEdit | readonly AnalysisEdit[]) => AnalysisEditResult;
}

export interface AnalysisEditorProps {
  initialAnalysis: SentenceAnalysis;
  onChange: (analysis: SentenceAnalysis) => void;
}

export interface AnalysisEditorProviderProps extends AnalysisEditorProps {
  children: ReactNode;
}

export interface AnalysisItemProps {
  id: string;
}
export interface ChunkEditorProps {
  chunk: import("@/entities/grammar-note").SentenceChunk;
}
export interface SyntaxEditorProps {
  annotation: SyntaxAnnotation;
}
export interface ConstructionEditorProps {
  annotation: ConstructionAnnotation;
}
export interface RangeFieldsProps {
  ranges: readonly import("@/entities/grammar-note").TextRange[];
  source: string;
  onChange: (ranges: import("@/entities/grammar-note").TextRange[]) => void;
}

export interface BoundarySelectProps {
  label: string;
  source: string;
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (position: number) => void;
}
