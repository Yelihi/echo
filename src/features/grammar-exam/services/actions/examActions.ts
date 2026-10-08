"use server";
import { z } from "zod";
import { GrammarSessionError } from "@/entities/grammar-session";
import { grammarExamFeedbackSchema } from "../../models/schema";
import { GrammarExamError } from "../../models/errors";
import { createExamPrompts } from "../createExamPrompts";
import { requestExamFeedback } from "../requestExamFeedback";
import { createFeedbackPersistence } from "../server/feedbackPersistence";
import { createOpenAIExamProvider } from "../server/openAIExamProvider";
import { createExamAccess, consumeExamRequest } from "../server/examAccess";
import { observeExamAction } from "../server/observeExamAction";

async function prepareSession(id: string, access: Awaited<ReturnType<typeof createExamAccess>>) {
  const session = await access.repository.findById(id);
  if (!session) throw new GrammarSessionError("NOT_FOUND");
  if (session.mode !== "exam") throw new GrammarExamError("INVALID_INPUT");
  if (session.questions.some((q) => q.kind === "novel")) return session;
  await consumeExamRequest(access.supabase);
  const questions = await createExamPrompts(session, createOpenAIExamProvider());
  return access.repository.setExamPrompts(session.id, questions);
}
export async function startGrammarExam(input: unknown) {
  return observeExamAction("grammar.exam.start", async () => {
    const data = z.object({ noteId: z.string().uuid(), requestId: z.string().uuid() }).parse(input);
    const access = await createExamAccess();
    const session = await access.repository.start({ ...data, mode: "exam" });
    return prepareSession(session.id, access);
  });
}
export async function prepareGrammarExam(id: string) {
  return observeExamAction("grammar.exam.prepare", async () =>
    prepareSession(z.string().uuid().parse(id), await createExamAccess()),
  );
}
export async function readGrammarExamFeedback(id: string) {
  return observeExamAction("grammar.exam.feedback.read", async () => {
    z.string().uuid().parse(id);
    const { repository, supabase } = await createExamAccess();
    const session = await repository.findById(id);
    if (!session) throw new GrammarSessionError("NOT_FOUND");
    if (session.mode !== "exam" || session.status !== "completed")
      throw new GrammarExamError("NOT_READY");
    const { data, error } = await supabase
      .from("grammar_exam_feedback")
      .select("feedback")
      .eq("session_id", id);
    if (error) throw new GrammarExamError("FAILED");
    return data.map((row) => grammarExamFeedbackSchema.parse(row.feedback));
  });
}
export async function requestGrammarExamFeedback(input: unknown) {
  return observeExamAction("grammar.exam.feedback.generate", async () => {
    const args = z
      .object({ sessionId: z.string().uuid(), questionId: z.string().min(1).max(120) })
      .parse(input);
    const { repository, supabase } = await createExamAccess();
    return requestExamFeedback(args.sessionId, args.questionId, {
      loadSession: (id) => repository.findById(id),
      ...createFeedbackPersistence(supabase),
      consumeRequest: () => consumeExamRequest(supabase),
      provider: createOpenAIExamProvider(),
    });
  });
}
