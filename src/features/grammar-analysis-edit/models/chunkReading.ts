import type { SentenceAnalysis } from "@/entities/grammar-note";
import type { ChunkReading } from "./interface";

/** Read AI/user annotations; do not infer grammar in presentation components. */
export function getChunkReading(analysis: SentenceAnalysis, id: string): ChunkReading | null {
  const chunk = analysis.chunks.find((item) => item.id === id);
  if (!chunk) return null;
  const overlaps = (range: { start: number; end: number }) =>
    range.start < chunk.range.end && chunk.range.start < range.end;
  const syntax = analysis.syntax.filter((item) => item.ranges.some(overlaps));
  const specific = syntax.filter((item) => item.role !== "other");
  return {
    text: analysis.sourceText.slice(chunk.range.start, chunk.range.end).trim(),
    meaning: chunk.literalMeaning,
    explanation: chunk.explanation,
    roles: [...new Set((specific.length ? specific : syntax).map((item) => item.label))],
    constructions: analysis.constructions.filter((item) => item.ranges.some(overlaps)),
  };
}
