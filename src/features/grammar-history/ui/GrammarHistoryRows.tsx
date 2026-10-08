import Link from "next/link";
import type { GrammarSessionSummary } from "@/entities/grammar-session";
import { formatGrammarPracticeDate } from "../services/formatPracticeDate";

export function GrammarHistoryRows({
  items,
  resultHref,
}: {
  items: readonly GrammarSessionSummary[];
  resultHref?: (sessionId: string) => string;
}) {
  if (!items.length)
    return (
      <p className="py-8 text-center text-sm text-practice-secondary">
        아직 완료한 연습이 없습니다.
      </p>
    );

  return (
    <ul className="divide-y divide-practice-line">
      {items.map((item) => (
        <li key={item.id} className="py-5">
          <Link
            href={resultHref?.(item.id) ?? `/grammar-sessions/${item.id}/result`}
            className="flex min-h-11 items-center justify-between gap-3 rounded-md focus-visible:outline-practice-focus"
          >
            <div>
              <time dateTime={item.completedAt} className="text-sm text-practice-body">
                {formatGrammarPracticeDate(item.completedAt)}
              </time>
              <p className="mt-2 text-sm text-practice-secondary">
                {item.mode === "recall" ? "암기 연습" : "시험 연습"} · {item.questionCount}문장 ·
                완료
              </p>
            </div>
            <span className="text-sm text-practice-body">결과 보기 →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
