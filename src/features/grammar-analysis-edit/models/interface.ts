import type { ReactNode } from "react";
import type {
  ConstructionAnnotation,
  SentenceAnalysis,
  SentenceChunk,
  TextRange,
  SyntaxAnnotation,
} from "@/entities/grammar-note";

import type { AnalysisEdit, AnalysisEditResult } from "./editAnalysis";

export interface AnalysisEditorState {
  readonly analysis: SentenceAnalysis;
  readonly selectedId: string | null;
  readonly editing: boolean;
  readonly dirty: boolean;
  readonly pendingSelection: { id: string | null; editing: boolean } | null;
  readonly readingId: string | null;
  startEditing: () => void;
  finishEditing: () => void;
  addSyntax: () => AnalysisEditResult;
  markDirty: () => void;
  resolveSelection: (discard: boolean) => void;
  select: (id: string | null) => void;
  edit: (edit: AnalysisEdit | readonly AnalysisEdit[]) => AnalysisEditResult;
}

export interface AnalysisEditorProps {
  initialAnalysis: SentenceAnalysis;
  onChange: (analysis: SentenceAnalysis) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export interface AnalysisEditorProviderProps extends AnalysisEditorProps {
  children: ReactNode;
}

export interface AnalysisItemProps {
  id: string;
}
export interface ChunkEditorProps {
  chunk: SentenceChunk;
}
export interface SyntaxEditorProps {
  annotation: SyntaxAnnotation;
}
export interface ConstructionEditorProps {
  annotation: ConstructionAnnotation;
}
export interface RangeFieldsProps {
  ranges: readonly TextRange[];
  source: string;
  onChange: (ranges: TextRange[]) => void;
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

export interface ChunkReading {
  readonly text: string;
  readonly meaning: string;
  readonly explanation: string;
  readonly roles: readonly string[];
  readonly constructions: readonly ConstructionAnnotation[];
}

export interface AnalysisKeyboardBoundaryProps {
  children: ReactNode;
}

export interface ChunkBoundaryEditorProps extends ChunkEditorProps {
  source: string;
  nextEnd?: number;
  onApply: (edit: AnalysisEdit) => void;
}

export interface ChunkSplitEditorProps extends ChunkEditorProps {
  source: string;
  onApply: (edit: AnalysisEdit) => void;
}
