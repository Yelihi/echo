import { PageContainer } from "@/widgets/app-shell";
import { GrammarEditorView } from "@/views/grammar-editor";
import { GrammarEditorClient } from "../_components/GrammarEditorClient";

export default async function NewGrammarNotePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <PageContainer>
      <GrammarEditorView>
        <GrammarEditorClient backHref={returnTo} />
      </GrammarEditorView>
    </PageContainer>
  );
}
