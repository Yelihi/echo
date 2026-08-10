import {
  AnalysisResultView,
  getRoleplayResultPageViewModel,
  retryRoleplayAnalysis,
} from "@/views/analysis-result";
import type { SessionId } from "@/entities/value-object";

interface RoleplayResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoleplayResultPage({ params }: RoleplayResultPageProps) {
  const { id } = await params;
  const sessionId = id as SessionId;
  const viewModel = await getRoleplayResultPageViewModel(sessionId);

  async function retryAction() {
    "use server";

    await retryRoleplayAnalysis(sessionId);
  }

  return <AnalysisResultView viewModel={viewModel} retryAction={retryAction} />;
}
