import type { SentenceAnalysis } from "./entity";
import type { TextRange } from "./value-objects";

export interface AnalysisIssue {
  // 객체 키와 배열 인덱스로 오류 위치를 표현한다. 예: ["chunks", 0, "range"].
  // schema.ts에서 Zod의 ctx.addIssue에 그대로 전달한다.
  readonly path: (string | number)[];
  readonly message: string;
}

/** 원문을 정규화하지 않고 UTF-16 서로게이트 쌍의 중간을 자르는지 확인한다. */
function isTextBoundary(text: string, position: number): boolean {
  // 경계 앞이 상위 서로게이트이고 뒤가 하위 서로게이트이면 한 문자를 나누는 위치다.
  const before = text.charCodeAt(position - 1);
  const after = text.charCodeAt(position);
  return !(before >= 0xd800 && before <= 0xdbff && after >= 0xdc00 && after <= 0xdfff);
}

export function isValidTextRange(text: string, range: TextRange): boolean {
  // 1. 시작과 끝이 정수이며, 원문 안의 비어 있지 않은 구간인지 확인한다.
  return (
    Number.isInteger(range.start) &&
    Number.isInteger(range.end) &&
    range.start >= 0 &&
    range.start < range.end &&
    range.end <= text.length &&
    // 2. 양쪽 경계가 UTF-16 서로게이트 쌍을 나누지 않는지 확인한다.
    isTextBoundary(text, range.start) &&
    isTextBoundary(text, range.end)
  );
}

export function getAnalysisIssues(analysis: SentenceAnalysis): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  // 공통 검사: 의미 덩어리·문장 성분·구문 전체에서 ID 중복과 개별 구간의 유효성을 확인한다.
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

  // 1. 의미 덩어리의 ID와 범위를 검사하고, 원문 처음부터 공백·구두점까지 빈틈없이 이어지는지 확인한다.
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
  // 마지막 덩어리의 끝이 원문 끝과 같아야 전체 문장을 포함한 것이다.
  if (nextStart !== analysis.sourceText.length) {
    issues.push({ path: ["chunks"], message: "의미 덩어리가 원문 전체를 포함해야 합니다." });
  }

  // 2. 문장 성분과 구문의 ID·범위를 검사하고, 각 항목 안의 구간이 원문 순서이며 서로 겹치지 않는지 확인한다.
  // 서로 다른 항목 사이의 겹침은 중첩된 문법 표현을 위해 허용한다.
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

  // 3. 문장 성분의 상위 항목 존재 여부 → 구간 포함 관계 → 계층 순환 여부를 차례로 확인한다.
  const syntaxById = new Map(analysis.syntax.map((item) => [item.id, item]));
  analysis.syntax.forEach((annotation, index) => {
    if (annotation.parentId === null) return;
    const path = ["syntax", index, "parentId"];
    const parent = syntaxById.get(annotation.parentId);
    // 3-1. 지정한 상위 항목이 실제로 존재해야 한다.
    if (!parent) {
      issues.push({ path, message: "상위 문법 항목을 찾을 수 없습니다." });
      return;
    }
    // 3-2. 모든 하위 구간은 상위 항목의 구간 중 하나에 완전히 포함되어야 한다.
    if (
      !annotation.ranges.every((child) =>
        parent.ranges.some((range) => range.start <= child.start && child.end <= range.end),
      )
    ) {
      issues.push({ path, message: "하위 구간은 상위 구간 안에 있어야 합니다." });
    }
    // 3-3. 상위 항목을 따라가며 자기 참조와 여러 항목을 거치는 순환을 검사한다.
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
