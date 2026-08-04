import { notFound } from "next/navigation";

import { getMemorizationReadyMockMaterial } from "@/views/memorization/config/readyMock";
import type { MemorizationReadyViewProps } from "@/views/memorization/models/ready";
import { MemorizationReadyContent } from "@/views/memorization/ui/MemorizationReadyContent";

export function MemorizationReadyView({ materialId }: MemorizationReadyViewProps) {
  const material = getMemorizationReadyMockMaterial(materialId);

  if (!material) {
    notFound();
  }

  return <MemorizationReadyContent material={material} />;
}
