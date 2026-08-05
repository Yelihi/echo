import { FileText, Mic2, Pilcrow } from "lucide-react";

import { Chip } from "@/shared/components";
import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import { SessionReadyHero } from "@/shared/components/ui";
import { SessionReadyShell } from "@/widgets/session-ready";
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";
import { MemorizationReadyModeAside } from "@/views/memorization/ui/MemorizationReadyModeAside";

interface MemorizationReadyContentProps {
  material: MemorizationReadyMaterial;
}

export function MemorizationReadyContent({ material }: MemorizationReadyContentProps) {
  return (
    <SessionReadyShell
      pillar="memo"
      backHref="/sentence-memorization"
      backLabel="문장 암기 목록으로 돌아가기"
      totalSteps={material.paragraphCount}
    >
      <div className="flex flex-col gap-5">
        <SessionReadyHero
          theme="memo"
          tags={material.tags}
          title={material.title}
          subtitle={material.description}
        >
          <StatItem icon={<Pilcrow />} label="문단" value={`${material.paragraphCount}개`} />
          <StatItem icon={<FileText />} label="단어" value={`${material.wordCount}개`} />
          <StatItem icon={<Mic2 />} label="통째 녹음" value="1회" />
        </SessionReadyHero>

        <div className="rounded-hero border border-session-glass-line bg-session-glass p-5 text-white shadow-heavy backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-heading-xs font-bold">녹음 방식</h2>
              <p className="mt-1 text-body-3 text-white/65">
                전체 본문을 한 번의 녹음으로 기록합니다.
              </p>
            </div>
            <Chip tone="memo">{material.difficulty}</Chip>
          </div>
        </div>
      </div>

      <MemorizationReadyModeAside materialId={material.id} />
    </SessionReadyShell>
  );
}
