import { notFound } from "next/navigation";

import { getMemorizationReadyMockMaterial } from "@/views/memorization/config/readyMock";
import type { MemorizationReadyViewProps } from "@/views/memorization/models/ready";
import { MemorizationReadyClient } from "@/views/memorization/ui/MemorizationReadyClient";

export function MemorizationReadyView({ materialId }: MemorizationReadyViewProps) {
  const material = getMemorizationReadyMockMaterial(materialId);

  if (!material) {
    notFound();
  }

  return <MemorizationReadyClient material={material} />;
}
