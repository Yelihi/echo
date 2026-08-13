import { LATEST_SESSIONS } from "@/views/latest-sessions/config/mock";
import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";

export function LatestSessionsView() {
  return (
    <section className="flex w-full flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-heading-md font-bold text-black-primary">학습 기록</h1>
        <p className="text-body-4 text-gray-text">
          최근 진행한 세션과 분석 결과를 한곳에서 확인하세요.
        </p>
      </header>

      <div className="flex w-full flex-col gap-2.5">
        {LATEST_SESSIONS.map((session) => (
          <SessionSimplified key={`${session.sessionType}-${session.title}`} {...session} />
        ))}
      </div>
    </section>
  );
}
