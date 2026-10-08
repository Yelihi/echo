import type { GrammarSession, GrammarSessionQuestion } from "@/entities/grammar-session";
import type { GrammarExamProvider } from "../models/interface";
import { grammarExamPromptOutputSchema } from "../models/schema";
import { GrammarExamError } from "../models/errors";

export async function createExamPrompts(
  session: GrammarSession,
  provider: GrammarExamProvider,
): Promise<GrammarSessionQuestion[]> {
  const response = await provider.createPrompts({
    targetGrammar: session.learningNote,
    existingTranslations: session.questions.map((question) => question.translation),
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
