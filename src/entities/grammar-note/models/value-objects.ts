// 독립적인 식별자로 추적하지 않고 값으로 다루는 어법 노트의 구성 요소.
/** 사용자가 작성한 입력 값. 제목과 태그는 AI 메타데이터에서 관리한다. */
export interface GrammarSource {
  readonly sentence: string;
  readonly learningNote: string;
  readonly revision: number;
}

export interface GrammarMetadata {
  readonly source: "ai";
  readonly sourceRevision: number;
  readonly title: string;
  readonly tags: readonly string[];
  readonly grammarKey: string | null;
}

/** 원문을 변경하지 않은 UTF-16 위치. start는 포함하고 end는 제외한다. */
export interface TextRange {
  readonly start: number;
  readonly end: number;
}

export type SyntaxRole = "subject" | "verb" | "object" | "complement" | "modifier" | "other";
