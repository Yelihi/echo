import type {
  ConstructionAnnotation,
  SentenceAnalysis,
  SentenceChunk,
  SyntaxAnnotation,
} from "@/entities/grammar-note";

export type AnalysisEditResult =
  | { ok: true; analysis: SentenceAnalysis }
  | { ok: false; message: string };

export type ChunkExplanation = Pick<SentenceChunk, "literalMeaning" | "explanation">;

export interface AnalysisEditing {
  editChunk(chunkId: string, explanation: ChunkExplanation): AnalysisEditResult;
  moveBoundary(chunkId: string, end: number): AnalysisEditResult;
  splitChunk(chunkId: string, offset: number, newId: string): AnalysisEditResult;
  mergeNext(chunkId: string): AnalysisEditResult;
  saveSyntax(annotation: SyntaxAnnotation): AnalysisEditResult;
  deleteSyntax(id: string): AnalysisEditResult;
  saveConstruction(annotation: ConstructionAnnotation): AnalysisEditResult;
  deleteConstruction(id: string): AnalysisEditResult;
}

/** 이벤트가 필요한 메서드를 직접 선택한다. 공통 적용 경로는 편집 종류를 해석하지 않는다. */
export type AnalysisEdit = (service: AnalysisEditing) => AnalysisEditResult;
