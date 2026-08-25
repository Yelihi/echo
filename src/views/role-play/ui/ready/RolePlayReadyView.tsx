import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { MaterialId } from "@/entities/value-object";

// views
import type { RolePlayReadyViewProps } from "@/views/role-play/models/interface";
import { getRolePlayReadyMaterial } from "@/views/role-play/services/server/getRolePlayReadyMaterial";
import { RolePlayReadyClient } from "@/views/role-play/ui/ready/RolePlayReadyClient";

export async function RolePlayReadyView({ materialId }: RolePlayReadyViewProps) {
  if (!isUuidString(materialId)) {
    notFound();
  }

  const material = await getRolePlayReadyMaterial(materialId as MaterialId);

  if (!material) {
    notFound();
  }

  return <RolePlayReadyClient material={material} />;
}
