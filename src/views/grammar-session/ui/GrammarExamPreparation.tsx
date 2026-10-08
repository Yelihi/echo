"use client";
import { grammarExamErrorMessage } from "@/features/grammar-exam";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GrammarSession } from "@/entities/grammar-session";
import { prepareGrammarExam } from "@/features/grammar-exam/services/actions/examActions";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import { Button } from "@/shared/components/atomics/button/Button";

/** 생성 실패 후 이어하기로 들어온 세션만 다시 준비한다. 문제 생성 책임은 feature action에 둔다. */
export function GrammarExamPreparation({
  session,
  returnTo,
}: {
  session: GrammarSession;
  returnTo: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function retryPreparation() {
    setPending(true);
    setError(null);
    try {
      const result = await prepareGrammarExam(session.id);
      if (result.ok) router.refresh();
      else setError(grammarExamErrorMessage(result.code));
    } catch {
      setError("시험 문제를 준비하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-8">
      <BackNavigation
        href={`/grammar/${session.noteId}/practice?returnTo=${encodeURIComponent(returnTo)}`}
        disabled={pending}
      />
      <h1 className="text-2xl font-medium text-practice-ink">시험 문제를 준비해주세요</h1>
      <p className="text-sm leading-7 text-practice-muted">
        기존 문장과 함께 연습할 새로운 작문 문제를 준비합니다. 생성이 중단되었다면 같은 세션에서
        다시 시도할 수 있어요.
      </p>
      <Button disabled={pending} onClick={retryPreparation}>
        {pending ? "문제 준비 중…" : "문제 생성 다시 시도"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-practice-accent">
          {error}
        </p>
      )}
    </div>
  );
}
