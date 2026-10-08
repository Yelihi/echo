import { PageContainer } from "@/widgets/app-shell";
import { GrammarEditorView } from "@/views/grammar-editor";
export default async function NewGrammarNotePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <PageContainer>
      <GrammarEditorView backHref={returnTo} />
    </PageContainer>
  );
}
