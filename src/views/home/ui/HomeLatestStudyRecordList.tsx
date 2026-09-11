import { EmptyState } from "@/shared/components/ui";
import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";
import { getLatestStudySessions } from "@/widgets/latest-sessions/services/server/getLatestStudySessions";

export async function HomeLatestStudyRecordList() {
  const latestFiveSessions = await getLatestStudySessions();

  if (latestFiveSessions.length === 0) {
    return (
      <EmptyState
        className="rounded-card border border-card-line bg-white"
        title="아직 학습 기록이 없어요"
        description="롤플레이나 암기를 시작하면 여기에 나타나요."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      {latestFiveSessions.map((session) => (
        <SessionSimplified key={session.id} {...session} />
      ))}
    </div>
  );
}
