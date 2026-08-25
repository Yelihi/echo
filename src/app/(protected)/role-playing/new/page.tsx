// widgets
import { PageContainer } from "@/widgets/app-shell";

// views
import { RolePlayEditorView } from "@/views/role-play";

export default function NewRolePlayingPage() {
  return (
    <PageContainer>
      <RolePlayEditorView mode="create" />
    </PageContainer>
  );
}
