import { notFound } from "next/navigation";

import {
  AnalysisResultView,
  getMemorizationResultPageViewModel,
  retryMemorizationAnalysis,
} from "@/views/analysis-result";
import type { SessionId } from "@/entities/value-object";
import { isUuidString } from "@/shared/utils/uuid";
import { PageContainer } from "@/widgets/app-shell";

interface MemorizationResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemorizationResultPage({ params }: MemorizationResultPageProps) {
  const { id } = await params;
  if (!isUuidString(id)) {
    notFound();
  }

  const sessionId = id as SessionId;
  const viewModel = await getMemorizationResultPageViewModel(sessionId);

  async function retryAction() {
    "use server";

    await retryMemorizationAnalysis(sessionId);
  }

  return (
    <PageContainer className="max-w-[928px]">
      <AnalysisResultView viewModel={viewModel} retryAction={retryAction} />
    </PageContainer>
  );
}
