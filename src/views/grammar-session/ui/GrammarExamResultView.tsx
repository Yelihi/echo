import type { GrammarSession } from "@/entities/grammar-session";
import { GrammarExamResult } from "@/features/grammar-exam";
import type { GrammarExamFeedback } from "@/features/grammar-exam";
import { requestGrammarExamFeedback } from "@/features/grammar-exam/services/actions/examActions";

export function GrammarExamResultView({
  session,
  initialFeedback,
  autoRequest,
}: {
  session: GrammarSession;
  initialFeedback: GrammarExamFeedback[];
  autoRequest: boolean;
}) {
  return (
    <GrammarExamResult
      session={session}
      initialFeedback={initialFeedback}
      autoRequest={autoRequest}
      onRequestFeedback={requestGrammarExamFeedback}
    />
  );
}
