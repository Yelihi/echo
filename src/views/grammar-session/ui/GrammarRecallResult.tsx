import type { GrammarSession } from "@/entities/grammar-session";

export function GrammarRecallResult({ session }: { session: GrammarSession }) {
  return (
    <section className="space-y-5" aria-label="암기 연습 결과">
      <p className="text-sm leading-7 text-practice-muted">
        {session.questions.length}개 문장의 부분 완성과 전체 회상을 마쳤어요. 내가 쓴 문장과 원문을
        함께 확인해 보세요.
      </p>
      <ol className="divide-y divide-practice-line rounded-2xl border border-practice-line bg-white px-6 shadow-practice-panel">
        {session.questions.map((question, index) => (
          <li key={question.id} className="space-y-3 py-6">
            <p className="text-xs tracking-widest text-practice-muted">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="text-sm leading-7 text-practice-secondary">{question.translation}</p>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-practice-muted">내가 쓴 문장</dt>
                <dd
                  lang="en"
                  className="mt-1 whitespace-pre-wrap break-words text-lg leading-8 text-practice-ink"
                >
                  {session.answers[`whole:${question.id}`]}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-practice-muted">원문</dt>
                <dd
                  lang="en"
                  className="mt-1 break-words text-base leading-7 text-practice-secondary"
                >
                  {question.sentence}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
