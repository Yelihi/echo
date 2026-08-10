import { FileText, Mic2, Pilcrow } from "lucide-react";

import { SessionReadyHero } from "@/shared/components";
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";
import { MemorizationReadyModeAside } from "@/views/memorization/ui/MemorizationReadyModeAside";

interface MemorizationReadyContentProps {
  material: MemorizationReadyMaterial;
}

export function MemorizationReadyContent({ material }: MemorizationReadyContentProps) {
  return (
    <>
      <SessionReadyHero
        tags={material.tags}
        title={material.title}
        description={material.description}
        stats={[
          { icon: <Pilcrow />, label: "문단", value: material.paragraphCount },
          { icon: <FileText />, label: "단어", value: material.wordCount },
          { icon: <Mic2 />, label: "문단 녹음", value: `${material.paragraphCount}회` },
        ]}
      />

      <MemorizationReadyModeAside materialId={material.id} />
    </>
  );
}
