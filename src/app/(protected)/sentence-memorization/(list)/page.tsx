// widgets
import { PageContainer } from "@/widgets/app-shell";

// shared
import { parsePageQuery } from "@/shared/utils/pagination";

// views
import { MemorizationView } from "@/views/memorization";
import { parseMemorizationTagQuery } from "@/views/memorization/services/filterMemorizationMaterialByTag";

interface SentenceMemorizationPageProps {
  searchParams: Promise<{ page?: string; tag?: string | string[] }>;
}

export default async function SentenceMemorizationPage({
  searchParams,
}: SentenceMemorizationPageProps) {
  const { page, tag } = await searchParams;

  return (
    <PageContainer>
      <MemorizationView page={parsePageQuery(page)} tags={parseMemorizationTagQuery(tag)} />
    </PageContainer>
  );
}
