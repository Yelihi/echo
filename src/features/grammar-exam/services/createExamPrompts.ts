import type { GrammarSession, GrammarSessionQuestion } from "@/entities/grammar-session";
import type { GrammarExamProvider } from "../models/interface";
import { grammarExamPromptOutputSchema } from "../models/schema";
import { GrammarExamError } from "../models/errors";
/** 원본 답안을 변형하지 않고 새 문맥만 생성합니다. 검증이 끝난 문제를 세션에 고정합니다. */
export async function createExamPrompts(
  session: GrammarSession,
  provider: GrammarExamProvider,
): Promise<GrammarSessionQuestion[]> {
  const response = await provider.createPrompts({
    targetGrammar: session.learningNote,
    existingTranslations: session.questions.map((q) => q.translation),
  });
  const parsed = grammarExamPromptOutputSchema.safeParse(response);
  if (!parsed.success) throw new GrammarExamError("FAILED");
  return parsed.data.questions.map((question, index) => ({
    id: `novel:${index + 1}`,
    kind: "novel",
    sentence: null,
    chunks: [],
    context: question.context,
    translation: question.instruction,
    requiredWords: question.requiredWords,
  }));
}
