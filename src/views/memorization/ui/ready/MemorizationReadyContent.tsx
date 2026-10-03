import { FileText, Mic2, Pilcrow } from "lucide-react";

import { SessionReadyHero } from "@/shared/components";
import type { MemorizationReadyMaterial } from "@/features/memorization-sessions/models/ready";
import { MemorizationReadyModeAside } from "@/views/memorization/ui/ready/MemorizationReadyModeAside";

interface MemorizationReadyContentProps {
  material: MemorizationReadyMaterial;
}

export function MemorizationReadyContent({ material }: MemorizationReadyContentProps) {
  return (
    <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
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

      <div className="border-t border-card-line pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
        <MemorizationReadyModeAside materialId={material.id} />
      </div>
    </div>
  );
}
