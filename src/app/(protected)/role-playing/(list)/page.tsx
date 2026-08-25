// widgets
import { PageContainer } from "@/widgets/app-shell";

// views
import { RolePlayView } from "@/views/role-play";
import { parseRolePlayTagQuery } from "@/views/role-play/services/filterRolePlayMaterialByTag";

interface RolePlayingPageProps {
  searchParams: Promise<{ page?: string; tag?: string | string[] }>;
}

export default async function RolePlayingPage({ searchParams }: RolePlayingPageProps) {
  const { page = "1", tag } = await searchParams;

  return (
    <PageContainer>
      <RolePlayView page={Number(page) || 1} tags={parseRolePlayTagQuery(tag)} />
    </PageContainer>
  );
}
