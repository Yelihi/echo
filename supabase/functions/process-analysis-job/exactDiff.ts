import type { DiffSegment } from "./types.ts";

// 이 파일은 `src/shared/lib/analysis-processor/exactDiff.ts`의 Edge Function 전용 복사본입니다.
//
// 공용 파일 하나를 Next 앱과 Supabase Edge Function이 같이 import하는 방식도 가능하지만,
// 지금은 선택하지 않습니다. Edge Function은 Deno 런타임이고 Next 앱은 tsconfig path alias,
// bundler 설정, server-only 모듈 경계의 영향을 받습니다. 공용화를 서두르면 Supabase 배포 시
// 로컬 Next 설정에 묶이거나, 반대로 앱 빌드가 Deno 전용 import/import map에 영향을 받는
// 복잡한 경계 문제가 생길 수 있습니다.
//
// 대신 작은 순수 함수 복사본을 유지합니다. 따라서 diff 알고리즘을 수정할 때는 반드시
// 앱 쪽 원본과 이 Edge Function 복사본을 함께 변경해야 합니다. 한쪽만 바뀌면 결과 화면과
// 비동기 processor가 서로 다른 diff를 저장/표시하는 drift가 생깁니다.
type DiffToken = {
  text: string;
  comparable: string;
};

type DiffPart = {
  op: "equal" | "insert" | "delete" | "replace";
  expected: string[];
  actual: string[];
};

export function createExactDiff(expectedText: string, actualText: string): DiffSegment[] {
  const expected = tokenize(expectedText);
  const actual = tokenize(actualText);
  const table = buildLcsTable(expected, actual);
  const parts = buildDiffParts(expected, actual, table);

  return mergeDiffParts(parts).map((part) => ({
    op: part.op,
    ...(part.expected.length > 0 ? { expected: part.expected.join(" ") } : {}),
    ...(part.actual.length > 0 ? { actual: part.actual.join(" ") } : {}),
  }));
}

function tokenize(text: string): DiffToken[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({
      text: token,
      comparable: token.toLocaleLowerCase().replace(/[.,!?;:]+$/u, ""),
    }));
}

function buildLcsTable(expected: DiffToken[], actual: DiffToken[]): number[][] {
  const table = Array.from({ length: expected.length + 1 }, () =>
    Array.from({ length: actual.length + 1 }, () => 0),
  );

  for (let expectedIndex = expected.length - 1; expectedIndex >= 0; expectedIndex -= 1) {
    for (let actualIndex = actual.length - 1; actualIndex >= 0; actualIndex -= 1) {
      table[expectedIndex][actualIndex] =
        expected[expectedIndex].comparable === actual[actualIndex].comparable
          ? table[expectedIndex + 1][actualIndex + 1] + 1
          : Math.max(table[expectedIndex + 1][actualIndex], table[expectedIndex][actualIndex + 1]);
    }
  }

  return table;
}

function buildDiffParts(expected: DiffToken[], actual: DiffToken[], table: number[][]): DiffPart[] {
  const parts: DiffPart[] = [];
  let expectedIndex = 0;
  let actualIndex = 0;

  while (expectedIndex < expected.length && actualIndex < actual.length) {
    if (expected[expectedIndex].comparable === actual[actualIndex].comparable) {
      pushPart(parts, {
        op: "equal",
        expected: [actual[actualIndex].text],
        actual: [actual[actualIndex].text],
      });
      expectedIndex += 1;
      actualIndex += 1;
    } else if (table[expectedIndex + 1][actualIndex] >= table[expectedIndex][actualIndex + 1]) {
      pushPart(parts, { op: "delete", expected: [expected[expectedIndex].text], actual: [] });
      expectedIndex += 1;
    } else {
      pushPart(parts, { op: "insert", expected: [], actual: [actual[actualIndex].text] });
      actualIndex += 1;
    }
  }

  while (expectedIndex < expected.length) {
    pushPart(parts, { op: "delete", expected: [expected[expectedIndex].text], actual: [] });
    expectedIndex += 1;
  }

  while (actualIndex < actual.length) {
    pushPart(parts, { op: "insert", expected: [], actual: [actual[actualIndex].text] });
    actualIndex += 1;
  }

  return parts;
}

function pushPart(parts: DiffPart[], next: DiffPart): void {
  const previous = parts.at(-1);

  if (previous?.op === next.op) {
    parts[parts.length - 1] = {
      op: previous.op,
      expected: [...previous.expected, ...next.expected],
      actual: [...previous.actual, ...next.actual],
    };
    return;
  }

  parts.push(next);
}

function mergeDiffParts(parts: DiffPart[]): DiffPart[] {
  const merged: DiffPart[] = [];
  let index = 0;

  while (index < parts.length) {
    const current = parts[index];
    const next = parts[index + 1];

    if (
      current &&
      next &&
      ((current.op === "delete" && next.op === "insert") ||
        (current.op === "insert" && next.op === "delete"))
    ) {
      merged.push({
        op: "replace",
        expected: [...current.expected, ...next.expected],
        actual: [...current.actual, ...next.actual],
      });
      index += 2;
      continue;
    }

    if (current) {
      merged.push(current);
    }
    index += 1;
  }

  return merged;
}
