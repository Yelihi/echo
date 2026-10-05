import type { SentenceAnalysis, TextRange } from "./entity";

export interface AnalysisIssue {
  readonly path: (string | number)[];
  readonly message: string;
}

/** Reject offsets that split a surrogate pair, without normalizing the source. */
function isTextBoundary(text: string, position: number): boolean {
  const before = text.charCodeAt(position - 1);
  const after = text.charCodeAt(position);
  return !(before >= 0xd800 && before <= 0xdbff && after >= 0xdc00 && after <= 0xdfff);
}

export function isValidTextRange(text: string, range: TextRange): boolean {
  return (
    Number.isInteger(range.start) &&
    Number.isInteger(range.end) &&
    range.start >= 0 &&
    range.start < range.end &&
    range.end <= text.length &&
    isTextBoundary(text, range.start) &&
    isTextBoundary(text, range.end)
  );
}

export function getAnalysisIssues(analysis: SentenceAnalysis): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const ids = new Set<string>();
  const checkId = (id: string, path: (string | number)[]) => {
    if (ids.has(id)) issues.push({ path, message: "분석 항목 ID가 중복되었습니다." });
    ids.add(id);
  };
  const checkRange = (range: TextRange, path: (string | number)[]) => {
    if (!isValidTextRange(analysis.sourceText, range)) {
      issues.push({ path, message: "문장 범위를 벗어나거나 문자를 나누는 구간입니다." });
    }
  };

  let nextStart = 0;
  analysis.chunks.forEach((chunk, index) => {
    checkId(chunk.id, ["chunks", index, "id"]);
    checkRange(chunk.range, ["chunks", index, "range"]);
    if (chunk.range.start !== nextStart) {
      issues.push({
        path: ["chunks", index, "range"],
        message: "의미 덩어리는 공백과 구두점까지 순서대로 연결되어야 합니다.",
      });
    }
    nextStart = chunk.range.end;
  });
  if (nextStart !== analysis.sourceText.length) {
    issues.push({ path: ["chunks"], message: "의미 덩어리가 원문 전체를 포함해야 합니다." });
  }

  for (const kind of ["syntax", "constructions"] as const) {
    analysis[kind].forEach((annotation, index) => {
      checkId(annotation.id, [kind, index, "id"]);
      let previousEnd = -1;
      annotation.ranges.forEach((range, rangeIndex) => {
        const path = [kind, index, "ranges", rangeIndex];
        checkRange(range, path);
        if (range.start < previousEnd) {
          issues.push({
            path,
            message: "한 항목의 구간은 겹치지 않게 원문 순서로 정렬해야 합니다.",
          });
        }
        previousEnd = range.end;
      });
    });
  }

  const syntaxById = new Map(analysis.syntax.map((item) => [item.id, item]));
  analysis.syntax.forEach((annotation, index) => {
    if (annotation.parentId === null) return;
    const path = ["syntax", index, "parentId"];
    const parent = syntaxById.get(annotation.parentId);
    if (!parent) {
      issues.push({ path, message: "상위 문법 항목을 찾을 수 없습니다." });
      return;
    }
    if (
      !annotation.ranges.every((child) =>
        parent.ranges.some((range) => range.start <= child.start && child.end <= range.end),
      )
    ) {
      issues.push({ path, message: "하위 구간은 상위 구간 안에 있어야 합니다." });
    }
    const visited = new Set([annotation.id]);
    let current: string | null = annotation.parentId;
    while (current !== null) {
      if (visited.has(current)) {
        issues.push({ path, message: "문법 항목의 계층은 순환할 수 없습니다." });
        break;
      }
      visited.add(current);
      current = syntaxById.get(current)?.parentId ?? null;
    }
  });
  return issues;
}
