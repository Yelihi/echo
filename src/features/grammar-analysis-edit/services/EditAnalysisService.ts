import type {
  ConstructionAnnotation,
  SentenceAnalysis,
  SyntaxAnnotation,
} from "@/entities/grammar-note";
import type { AnalysisEditing, AnalysisEditResult, ChunkExplanation } from "../models/editAnalysis";
import { validateAnalysisCandidate } from "./validateAnalysisCandidate";

/** 입력 스냅샷은 변경하지 않고, 각 메서드가 자신의 편집 후보만 만든다. */
export class EditAnalysisService implements AnalysisEditing {
  constructor(private readonly analysis: SentenceAnalysis) {}

  editChunk(chunkId: string, explanation: ChunkExplanation): AnalysisEditResult {
    const index = this.analysis.chunks.findIndex((chunk) => chunk.id === chunkId);
    if (index < 0) return missing();
    const chunks = [...this.analysis.chunks];
    chunks[index] = {
      ...chunks[index],
      literalMeaning: explanation.literalMeaning,
      explanation: explanation.explanation,
    };
    return validateAnalysisCandidate({ ...this.analysis, chunks });
  }

  moveBoundary(chunkId: string, end: number): AnalysisEditResult {
    const index = this.analysis.chunks.findIndex((chunk) => chunk.id === chunkId);
    if (index < 0) return missing();
    const chunk = this.analysis.chunks[index];
    const next = this.analysis.chunks[index + 1];
    if (!next) return { ok: false, message: "마지막 구간의 끝은 변경할 수 없습니다." };
    const chunks = [...this.analysis.chunks];
    chunks[index] = { ...chunk, range: { ...chunk.range, end } };
    chunks[index + 1] = { ...next, range: { ...next.range, start: end } };
    return validateAnalysisCandidate({ ...this.analysis, chunks });
  }

  splitChunk(chunkId: string, offset: number, newId: string): AnalysisEditResult {
    const index = this.analysis.chunks.findIndex((chunk) => chunk.id === chunkId);
    if (index < 0) return missing();
    const chunk = this.analysis.chunks[index];
    const chunks = [...this.analysis.chunks];
    chunks.splice(
      index,
      1,
      { ...chunk, range: { start: chunk.range.start, end: offset } },
      {
        id: newId,
        range: { start: offset, end: chunk.range.end },
        literalMeaning: "",
        explanation: "",
      },
    );
    return validateAnalysisCandidate({ ...this.analysis, chunks });
  }

  mergeNext(chunkId: string): AnalysisEditResult {
    const index = this.analysis.chunks.findIndex((chunk) => chunk.id === chunkId);
    if (index < 0) return missing();
    const chunk = this.analysis.chunks[index];
    const next = this.analysis.chunks[index + 1];
    if (!next) return { ok: false, message: "합칠 다음 구간이 없습니다." };
    const chunks = [...this.analysis.chunks];
    chunks.splice(index, 2, {
      ...chunk,
      range: { start: chunk.range.start, end: next.range.end },
      literalMeaning: [chunk.literalMeaning, next.literalMeaning].filter(Boolean).join(" "),
      explanation: [chunk.explanation, next.explanation].filter(Boolean).join("\n"),
    });
    return validateAnalysisCandidate({ ...this.analysis, chunks });
  }

  saveSyntax(annotation: SyntaxAnnotation): AnalysisEditResult {
    const exists = this.analysis.syntax.some((item) => item.id === annotation.id);
    const syntax = exists
      ? this.analysis.syntax.map((item) => (item.id === annotation.id ? annotation : item))
      : [...this.analysis.syntax, annotation];
    return validateAnalysisCandidate({ ...this.analysis, syntax });
  }

  deleteSyntax(id: string): AnalysisEditResult {
    if (!this.analysis.syntax.some((item) => item.id === id)) return missing();
    const syntax = this.analysis.syntax.filter((item) => item.id !== id);
    return validateAnalysisCandidate({ ...this.analysis, syntax });
  }

  saveConstruction(annotation: ConstructionAnnotation): AnalysisEditResult {
    const exists = this.analysis.constructions.some((item) => item.id === annotation.id);
    const constructions = exists
      ? this.analysis.constructions.map((item) => (item.id === annotation.id ? annotation : item))
      : [...this.analysis.constructions, annotation];
    return validateAnalysisCandidate({ ...this.analysis, constructions });
  }

  deleteConstruction(id: string): AnalysisEditResult {
    if (!this.analysis.constructions.some((item) => item.id === id)) return missing();
    const constructions = this.analysis.constructions.filter((item) => item.id !== id);
    return validateAnalysisCandidate({ ...this.analysis, constructions });
  }
}

function missing(): AnalysisEditResult {
  return { ok: false, message: "편집할 분석 항목을 찾을 수 없습니다." };
}
