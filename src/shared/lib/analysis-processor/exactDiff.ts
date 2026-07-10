export type AnalysisDiffOperation = "equal" | "insert" | "delete" | "replace";

export interface AnalysisDiffSegment {
  readonly op: AnalysisDiffOperation;
  readonly expected?: string;
  readonly actual?: string;
}

type Token = {
  readonly text: string;
  readonly comparable: string;
};

type DiffPart = {
  readonly op: AnalysisDiffOperation;
  readonly expected: string[];
  readonly actual: string[];
};

export function createExactDiff(
  expectedText: string,
  actualText: string,
): ReadonlyArray<AnalysisDiffSegment> {
  const expected = tokenize(expectedText);
  const actual = tokenize(actualText);
  const parts = buildDiffParts(expected, actual);

  return mergeDiffParts(parts).map(toDiffSegment);
}

function tokenize(text: string): Token[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({
      text: token,
      comparable: token.toLocaleLowerCase().replace(/[.,!?;:]+$/u, ""),
    }));
}

function buildDiffParts(expected: Token[], actual: Token[]): DiffPart[] {
  const table = buildLcsTable(expected, actual);
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
      continue;
    }

    if (table[expectedIndex + 1][actualIndex] >= table[expectedIndex][actualIndex + 1]) {
      pushPart(parts, {
        op: "delete",
        expected: [expected[expectedIndex].text],
        actual: [],
      });
      expectedIndex += 1;
    } else {
      pushPart(parts, {
        op: "insert",
        expected: [],
        actual: [actual[actualIndex].text],
      });
      actualIndex += 1;
    }
  }

  while (expectedIndex < expected.length) {
    pushPart(parts, {
      op: "delete",
      expected: [expected[expectedIndex].text],
      actual: [],
    });
    expectedIndex += 1;
  }

  while (actualIndex < actual.length) {
    pushPart(parts, {
      op: "insert",
      expected: [],
      actual: [actual[actualIndex].text],
    });
    actualIndex += 1;
  }

  return parts;
}

function buildLcsTable(expected: Token[], actual: Token[]): number[][] {
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

function toDiffSegment(part: DiffPart): AnalysisDiffSegment {
  return {
    op: part.op,
    ...(part.expected.length > 0 ? { expected: part.expected.join(" ") } : {}),
    ...(part.actual.length > 0 ? { actual: part.actual.join(" ") } : {}),
  };
}
