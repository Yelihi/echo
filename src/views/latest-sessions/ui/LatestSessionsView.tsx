import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";
import type { LatestSessionsViewProps } from "../models/interface";

export function LatestSessionsView({ sessions = [] }: LatestSessionsViewProps) {
  return (
    <section className="flex w-full flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-heading-md font-bold text-black-primary">학습 기록</h1>
        <p className="text-body-4 text-gray-text">
          최근 진행한 세션과 분석 결과를 한곳에서 확인하세요.
        </p>
      </header>

      <div className="flex w-full flex-col gap-2.5">
        {sessions.length === 0 && (
          <p className="py-10 text-center text-gray-text">아직 학습 기록이 없습니다.</p>
        )}
        {sessions.map((session) => (
          <SessionSimplified key={`${session.sessionType}-${session.id}`} {...session} />
        ))}
      </div>
    </section>
  );
}
