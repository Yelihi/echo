import { PageContainer } from "@/widgets/app-shell";
import { MemorizationEditorView } from "@/views/memorization";

interface EditSentenceMemorizationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSentenceMemorizationPage({
  params,
}: EditSentenceMemorizationPageProps) {
  const { id } = await params;

  return (
    <PageContainer className="lg:h-[calc(100dvh-(var(--spacing)*15.5))] lg:overflow-hidden lg:pb-6">
      <MemorizationEditorView mode="edit" materialId={id} />
    </PageContainer>
  );
}
