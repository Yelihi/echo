import type { SessionId } from "@/entities/value-object";
import type { AnalysisResultPageViewModel } from "@/views/analysis-result/models";

import { createMemorizationResultPageViewModel } from "./memorizationResultPageConverter";
import { getMemorizationResultPageData } from "./memorizationResultPageData";

export async function getMemorizationResultPageViewModel(
  sessionId: SessionId,
): Promise<AnalysisResultPageViewModel> {
  return createMemorizationResultPageViewModel(await getMemorizationResultPageData(sessionId));
}
