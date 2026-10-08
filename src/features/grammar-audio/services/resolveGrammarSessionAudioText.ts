import type { GrammarSession } from "@/entities/grammar-session";
import type { GrammarSessionAudioInput } from "../models/interface";

/** 노트의 이후 수정과 관계없이, 소유권을 검증한 암기 세션의 고정 문장만 읽는다. */
export function resolveGrammarSessionAudioText(
  session: GrammarSession | null,
  input: GrammarSessionAudioInput,
): string {
  if (!session || session.id !== input.sessionId || session.mode !== "recall")
    throw new Error("암기 연습 문장을 찾을 수 없습니다.");

  const question = session.questions.find((question) => question.id === input.questionId);

  if (!question?.sentence) throw new Error("연습 문장을 찾을 수 없습니다.");

  return question.sentence;
}
