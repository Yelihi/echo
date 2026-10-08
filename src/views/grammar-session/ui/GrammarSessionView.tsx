import type { ReactNode } from "react";
import type { GrammarSession } from "@/entities/grammar-session";
import { GrammarRecall } from "@/features/grammar-recall";

export function GrammarSessionView({
  session,
  children,
}: {
  session: GrammarSession;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-8 sm:px-8">
      {session.mode === "recall" ? (
        <GrammarRecall title={session.title}>{children}</GrammarRecall>
      ) : (
        children
      )}
    </div>
  );
}
