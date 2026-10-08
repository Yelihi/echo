import type { GrammarSession } from "@/entities/grammar-session";
import { GrammarSessionError } from "@/entities/grammar-session";
import type { GrammarExamProvider } from "../models/interface";
import type { GrammarExamFeedback } from "../models/schema";
import { GrammarExamError } from "../models/errors";
import { gradeExamAnswer } from "./gradeExamAnswer";

export interface ExamFeedbackDependencies {
  loadSession: (id: string) => Promise<GrammarSession | null>;
  readFeedback: (sessionId: string, questionId: string) => Promise<GrammarExamFeedback | null>;
  saveFeedback: (sessionId: string, feedback: GrammarExamFeedback) => Promise<GrammarExamFeedback>;
  consumeRequest: () => Promise<void>;
  provider: GrammarExamProvider;
}

export async function requestExamFeedback(
  sessionId: string,
  questionId: string,
  dependencies: ExamFeedbackDependencies,
) {
  const session = await dependencies.loadSession(sessionId);

  if (!session) throw new GrammarSessionError("NOT_FOUND");

  if (session.mode !== "exam" || session.status !== "completed")
    throw new GrammarExamError("NOT_READY");

  if (!session.questions.some((question) => question.id === questionId))
    throw new GrammarExamError("INVALID_INPUT");

  // 결과 재방문과 응답 유실 후 재시도에서는 이미 저장한 평가를 읽어 AI 비용을 다시 소비하지 않는다.
  const existing = await dependencies.readFeedback(sessionId, questionId);

  if (existing) return existing;

  await dependencies.consumeRequest();
  const feedback = await gradeExamAnswer(session, questionId, dependencies.provider);

  return dependencies.saveFeedback(sessionId, feedback);
}
