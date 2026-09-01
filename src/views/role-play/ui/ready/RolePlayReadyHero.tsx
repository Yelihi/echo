import { Clock, MessageSquare, Mic2 } from "lucide-react";

// shared
import { SessionReadyHero } from "@/shared/components";

// views
import type { RoleplayReadyMaterial } from "@/views/role-play/models/interface";

interface RolePlayReadyHeroProps {
  material: RoleplayReadyMaterial;
}

export function RolePlayReadyHero({ material }: RolePlayReadyHeroProps) {
  return (
    <SessionReadyHero
      tags={material.tags}
      title={material.title}
      description={material.description}
      stats={[
        { icon: <MessageSquare />, label: "총 대사", value: material.lineCount },
        { icon: <Mic2 />, label: "내 차례", value: material.learnerTurnCount },
        { icon: <Clock />, label: "예상 시간", value: `~${material.estimatedMinutes}분` },
      ]}
    />
  );
}
