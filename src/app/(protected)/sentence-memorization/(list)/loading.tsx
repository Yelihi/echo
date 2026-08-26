// widgets
import { PageContainer } from "@/widgets/app-shell";

// views
import { MemorizationViewFallback } from "@/views/memorization";

export default function SentenceMemorizationLoading() {
  return (
    <PageContainer>
      <MemorizationViewFallback />
    </PageContainer>
  );
}
