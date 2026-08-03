import { PageContainer } from "@/widgets/app-shell";
import { RolePlayEditorView } from "@/views/role-play";

interface EditRolePlayingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRolePlayingPage({ params }: EditRolePlayingPageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <RolePlayEditorView mode="edit" materialId={id} />
    </PageContainer>
  );
}
