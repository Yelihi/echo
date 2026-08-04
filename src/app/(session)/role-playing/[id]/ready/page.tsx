import { RolePlayReadyView } from "@/views/role-play";

interface RolePlayingReadyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RolePlayingReadyPage({ params }: RolePlayingReadyPageProps) {
  const { id } = await params;

  return <RolePlayReadyView materialId={id} />;
}
