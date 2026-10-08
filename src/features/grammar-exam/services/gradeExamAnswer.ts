import type { GrammarSession } from "@/entities/grammar-session";
import type { GrammarExamProvider } from "../models/interface";
import { grammarExamGradeOutputSchema } from "../models/schema";
import { GrammarExamError } from "../models/errors";
export async function gradeExamAnswer(
  session: GrammarSession,
  questionId: string,
  provider: GrammarExamProvider,
) {
  if (session.mode !== "exam" || session.status !== "completed")
    throw new GrammarExamError("NOT_READY");
  const question = session.questions.find((item) => item.id === questionId);
  if (!question) throw new GrammarExamError("INVALID_INPUT");
  const answer = session.answers[`${question.kind}:${question.id}`];
  if (!answer?.trim()) throw new GrammarExamError("INVALID_INPUT");
  const output = await provider.grade({ targetGrammar: session.learningNote, question, answer });
  const parsed = grammarExamGradeOutputSchema.safeParse(output);
  if (!parsed.success) throw new GrammarExamError("FAILED");
  return { ...parsed.data, questionId, answer };
}
