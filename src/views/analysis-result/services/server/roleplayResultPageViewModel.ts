import type { SessionId } from "@/entities/value-object";
import type { AnalysisResultPageViewModel } from "@/views/analysis-result/models";

import { getRoleplayResultPageData } from "./roleplayResultPageData";
import { createRoleplayResultPageViewModel } from "./roleplayResultPageConverter";

export async function getRoleplayResultPageViewModel(
  sessionId: SessionId,
): Promise<AnalysisResultPageViewModel> {
  return createRoleplayResultPageViewModel(await getRoleplayResultPageData(sessionId));
}
