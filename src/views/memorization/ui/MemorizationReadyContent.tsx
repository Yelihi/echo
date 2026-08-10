import { FileText, Mic2, Pilcrow } from "lucide-react";

import { Badge, Card } from "@/shared/components";
import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";
import { MemorizationReadyModeAside } from "@/views/memorization/ui/MemorizationReadyModeAside";

interface MemorizationReadyContentProps {
  material: MemorizationReadyMaterial;
}

export function MemorizationReadyContent({ material }: MemorizationReadyContentProps) {
  return (
    <>
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap gap-2">
          {material.tags.map((tag) => (
            <Badge key={tag} value={tag} size="small" />
          ))}
        </div>
        <div>
          <h1 className="text-heading-md font-bold text-black-primary">{material.title}</h1>
          <p className="mt-2 text-body-3 text-gray-text">{material.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatItem icon={<Pilcrow />} label="문단" value={material.paragraphCount} />
          <StatItem icon={<FileText />} label="단어" value={material.wordCount} />
          <StatItem icon={<Mic2 />} label="문단 녹음" value={`${material.paragraphCount}회`} />
        </div>
      </Card>

      <MemorizationReadyModeAside materialId={material.id} />
    </>
  );
}
