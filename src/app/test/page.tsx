import { TestAnalysisView } from "@/views/test";
import { assertTestAnalysisPageEnabled } from "@/shared/lib/test-analysis/guard";

export default function TestPage() {
  assertTestAnalysisPageEnabled();

  return <TestAnalysisView />;
}
