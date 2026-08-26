// widgets
import { PageContainer } from "@/widgets/app-shell";

// shared
import { parsePageQuery } from "@/shared/utils/pagination";

// views
import { RolePlayView } from "@/views/role-play";
import { parseRolePlayTagQuery } from "@/views/role-play/services/filterRolePlayMaterialByTag";

interface RolePlayingPageProps {
  searchParams: Promise<{ page?: string; tag?: string | string[] }>;
}

export default async function RolePlayingPage({ searchParams }: RolePlayingPageProps) {
  const { page, tag } = await searchParams;

  return (
    <PageContainer>
      <RolePlayView page={parsePageQuery(page)} tags={parseRolePlayTagQuery(tag)} />
    </PageContainer>
  );
}
