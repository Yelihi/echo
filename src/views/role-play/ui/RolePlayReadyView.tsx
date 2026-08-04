import { notFound } from "next/navigation";

import { getRoleplayReadyMockMaterial } from "@/views/role-play/config/readyMock";
import type { RolePlayReadyViewProps } from "@/views/role-play/models/ready";
import { RolePlayReadyClient } from "@/views/role-play/ui/RolePlayReadyClient";

export function RolePlayReadyView({ materialId }: RolePlayReadyViewProps) {
  const material = getRoleplayReadyMockMaterial(materialId);

  if (!material) {
    notFound();
  }

  return <RolePlayReadyClient material={material} />;
}
