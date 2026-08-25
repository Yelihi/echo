// widgets
import { PageContainer } from "@/widgets/app-shell";

// views
import { RolePlayViewFallback } from "@/views/role-play";

export default function RolePlayingLoading() {
  return (
    <PageContainer>
      <RolePlayViewFallback />
    </PageContainer>
  );
}
