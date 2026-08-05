import { FileText, Mic2, Pilcrow } from "lucide-react";

import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import { SessionReadyHero } from "@/shared/components/ui";
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";
import { MemorizationReadyModeAside } from "@/views/memorization/ui/MemorizationReadyModeAside";

interface MemorizationReadyContentProps {
  material: MemorizationReadyMaterial;
}

export function MemorizationReadyContent({ material }: MemorizationReadyContentProps) {
  return (
    <>
      <SessionReadyHero
        className="w-full"
        theme="memo"
        tags={material.tags}
        title={material.title}
        subtitle={material.description}
      >
        <StatItem icon={<Pilcrow />} label="문단" value={material.paragraphCount} />
        <StatItem icon={<FileText />} label="단어" value={material.wordCount} />
        <StatItem icon={<Mic2 />} label="통째 녹음" value="1회" />
      </SessionReadyHero>

      <MemorizationReadyModeAside materialId={material.id} />
    </>
  );
}
