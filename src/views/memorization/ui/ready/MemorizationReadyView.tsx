import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { MaterialId } from "@/entities/value-object";

// views
import type { MemorizationReadyViewProps } from "@/views/memorization/models/ready";
import { getMemorizationReadyMaterial } from "@/views/memorization/services/server/getMemorizationReadyMaterial";
import { MemorizationReadyContent } from "@/views/memorization/ui/ready/MemorizationReadyContent";

export async function MemorizationReadyView({ materialId }: MemorizationReadyViewProps) {
  if (!isUuidString(materialId)) {
    notFound();
  }

  const material = await getMemorizationReadyMaterial(materialId as MaterialId);

  if (!material) {
    notFound();
  }

  return <MemorizationReadyContent material={material} />;
}
