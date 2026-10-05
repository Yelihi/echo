import { sentenceAnalysisSchema } from "@/entities/grammar-note";
import type { SentenceAnalysis } from "@/entities/grammar-note";
import type { AnalysisEdit, AnalysisEditResult } from "../models/interface";

/** Apply edits atomically: invalid proposals never mutate the reviewed analysis. */
export function editAnalysis(analysis: SentenceAnalysis, edit: AnalysisEdit): AnalysisEditResult {
  let candidate: SentenceAnalysis = { ...analysis, reviewStatus: "needs-review" };
  if (edit.type === "save-syntax") {
    const exists = analysis.syntax.some((item) => item.id === edit.annotation.id);
    candidate = {
      ...candidate,
      syntax: exists
        ? analysis.syntax.map((item) => (item.id === edit.annotation.id ? edit.annotation : item))
        : [...analysis.syntax, edit.annotation],
    };
  } else if (edit.type === "delete-syntax") {
    if (!analysis.syntax.some((item) => item.id === edit.id)) return missing();
    candidate = { ...candidate, syntax: analysis.syntax.filter((item) => item.id !== edit.id) };
  } else if (edit.type === "save-construction") {
    const exists = analysis.constructions.some((item) => item.id === edit.annotation.id);
    candidate = {
      ...candidate,
      constructions: exists
        ? analysis.constructions.map((item) =>
            item.id === edit.annotation.id ? edit.annotation : item,
          )
        : [...analysis.constructions, edit.annotation],
    };
  } else if (edit.type === "delete-construction") {
    if (!analysis.constructions.some((item) => item.id === edit.id)) return missing();
    candidate = {
      ...candidate,
      constructions: analysis.constructions.filter((item) => item.id !== edit.id),
    };
  } else {
    const index = analysis.chunks.findIndex((chunk) => chunk.id === edit.chunkId);
    if (index < 0) return missing();
    const chunk = analysis.chunks[index];
    const next = analysis.chunks[index + 1];
    const chunks = [...analysis.chunks];
    if (edit.type === "edit-chunk") {
      chunks[index] = {
        ...chunk,
        literalMeaning: edit.literalMeaning,
        explanation: edit.explanation,
      };
    } else if (edit.type === "move-boundary") {
      if (!next) return { ok: false, message: "마지막 구간의 끝은 변경할 수 없습니다." };
      chunks[index] = { ...chunk, range: { ...chunk.range, end: edit.end } };
      chunks[index + 1] = { ...next, range: { ...next.range, start: edit.end } };
    } else if (edit.type === "split-chunk") {
      chunks.splice(
        index,
        1,
        { ...chunk, range: { start: chunk.range.start, end: edit.offset } },
        {
          id: edit.newId,
          range: { start: edit.offset, end: chunk.range.end },
          literalMeaning: "",
          explanation: "",
        },
      );
    } else {
      if (!next) return { ok: false, message: "합칠 다음 구간이 없습니다." };
      chunks.splice(index, 2, {
        ...chunk,
        range: { start: chunk.range.start, end: next.range.end },
        literalMeaning: [chunk.literalMeaning, next.literalMeaning].filter(Boolean).join(" "),
        explanation: [chunk.explanation, next.explanation].filter(Boolean).join("\n"),
      });
    }
    candidate = { ...candidate, chunks };
  }
  const parsed = sentenceAnalysisSchema.safeParse(candidate);
  return parsed.success
    ? { ok: true, analysis: parsed.data }
    : { ok: false, message: parsed.error.issues[0].message };
}

function missing(): AnalysisEditResult {
  return { ok: false, message: "편집할 분석 항목을 찾을 수 없습니다." };
}
