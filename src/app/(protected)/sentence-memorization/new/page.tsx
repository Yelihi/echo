import { PageContainer } from "@/widgets/app-shell";
import { MemorizationEditorView } from "@/views/memorization";

export default function NewSentenceMemorizationPage() {
  return (
    <PageContainer className="lg:h-[calc(100dvh-(var(--spacing)*15.5))] lg:overflow-hidden lg:pb-6">
      <MemorizationEditorView mode="create" />
    </PageContainer>
  );
}
