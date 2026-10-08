import { grammarReturnTo } from "@/views/grammar-detail";
import { PageContainer } from "@/widgets/app-shell";
import { GrammarEditorView } from "@/views/grammar-editor";
export default async function NewGrammarNotePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <PageContainer>
      <GrammarEditorView backHref={grammarReturnTo(returnTo)} />
    </PageContainer>
  );
}
