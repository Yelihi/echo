import { LatestSessionsView } from "@/views/latest-sessions";
import { PageContainer } from "@/widgets/app-shell";
import { getLatestStudySessions } from "@/widgets/latest-sessions/services/server/getLatestStudySessions";
import { ResultAutoRefresh } from "@/views/analysis-result";

export default async function SessionsPage() {
  const sessions = await getLatestStudySessions(50);
  return (
    <PageContainer>
      {sessions.some((session) => session.href && session.sessionState === "inProgress") && (
        <ResultAutoRefresh />
      )}
      <LatestSessionsView sessions={sessions} />
    </PageContainer>
  );
}
