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
    <PageContainer>
      <MemorizationEditorView mode="edit" materialId={id} />
    </PageContainer>
  );
}
