import { notFound } from "next/navigation";

import { getRoleplayReadyMockMaterial } from "@/views/role-play/config/readyMock";
import type { RolePlayReadyViewProps } from "@/views/role-play/models/ready";
import { RolePlayRecordingView } from "@/views/recording/role-play/ui/RolePlayRecordingView";

export function RolePlayReadyView({ materialId }: RolePlayReadyViewProps) {
  const material = getRoleplayReadyMockMaterial(materialId);

  if (!material) {
    notFound();
  }

  return <RolePlayRecordingView material={material} />;
}
