import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
import { grammarExamFeedbackSchema } from "../../models/schema";
import type { GrammarExamFeedback } from "../../models/schema";
import { GrammarExamError } from "../../models/errors";
export function createFeedbackPersistence(db: SupabaseClient<Database>) {
  return {
    readFeedback: async (sessionId: string, questionId: string) => {
      const { data, error } = await db
        .from("grammar_exam_feedback")
        .select("feedback")
        .eq("session_id", sessionId)
        .eq("question_id", questionId)
        .maybeSingle();
      if (error) throw new GrammarExamError("FAILED");
      return data ? grammarExamFeedbackSchema.parse(data.feedback) : null;
    },
    saveFeedback: async (sessionId: string, feedback: GrammarExamFeedback) => {
      const { data, error } = await db.rpc("save_grammar_exam_feedback", {
        p_session_id: sessionId,
        p_question_id: feedback.questionId,
        p_answer: feedback.answer,
        p_feedback: feedback,
      });
      if (error) throw new GrammarExamError("FAILED");
      return grammarExamFeedbackSchema.parse(data);
    },
  };
}
