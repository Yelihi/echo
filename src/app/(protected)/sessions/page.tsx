import { redirect } from "next/navigation";
import { LatestSessionsView } from "@/views/latest-sessions";
import type { SessionsPageProps } from "@/views/latest-sessions/models/interface";
import { PageContainer } from "@/widgets/app-shell";
import { getStudySessionPage } from "@/widgets/latest-sessions/services/server/getStudySessionPage";
import { historyHref, parseHistoryQuery } from "@/widgets/latest-sessions/models/history";
import { ResultAutoRefresh } from "@/views/analysis-result";

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const query = parseHistoryQuery(await searchParams);
  const data = await getStudySessionPage(query);
  if (data.page !== query.page) redirect(historyHref({ ...query, page: data.page }));
  return (
    <PageContainer>
      {(query.status === "inProgress" ||
        data.sessions.some((session) => session.sessionState === "inProgress")) && (
        <ResultAutoRefresh />
      )}
      <LatestSessionsView {...data} query={query} />
    </PageContainer>
  );
}
