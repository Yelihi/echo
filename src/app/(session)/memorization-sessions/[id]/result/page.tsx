import {
  AnalysisResultView,
  getMemorizationResultPageViewModel,
  retryMemorizationAnalysis,
} from "@/views/analysis-result";
import type { SessionId } from "@/entities/value-object";

interface MemorizationResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemorizationResultPage({ params }: MemorizationResultPageProps) {
  const { id } = await params;
  const sessionId = id as SessionId;
  const viewModel = await getMemorizationResultPageViewModel(sessionId);

  async function retryAction() {
    "use server";

    await retryMemorizationAnalysis(sessionId);
  }

  return <AnalysisResultView viewModel={viewModel} retryAction={retryAction} />;
}
