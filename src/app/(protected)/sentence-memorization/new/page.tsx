import { PageContainer } from "@/widgets/app-shell";
import { MemorizationEditorView } from "@/views/memorization";

export default function NewSentenceMemorizationPage() {
  return (
    <PageContainer>
      <MemorizationEditorView mode="create" />
    </PageContainer>
  );
}
