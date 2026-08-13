import { notFound } from "next/navigation";

import {
  AnalysisResultView,
  getRoleplayResultPageViewModel,
  retryRoleplayAnalysis,
} from "@/views/analysis-result";
import type { SessionId } from "@/entities/value-object";
import { PageContainer } from "@/widgets/app-shell";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RoleplayResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoleplayResultPage({ params }: RoleplayResultPageProps) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const sessionId = id as SessionId;
  const viewModel = await getRoleplayResultPageViewModel(sessionId);

  async function retryAction() {
    "use server";

    await retryRoleplayAnalysis(sessionId);
  }

  return (
    <PageContainer className="max-w-[928px]">
      <AnalysisResultView viewModel={viewModel} retryAction={retryAction} />
    </PageContainer>
  );
}
