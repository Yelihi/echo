"use client";

import { MessageSquare, Target } from "lucide-react";

// shared
import { SelectableOptionCard } from "@/shared/components/ui";

// views
import { ROLE_PLAY_READY_EVALUATION_MODES } from "@/views/role-play/config/const";
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { RolePlayReadySectionTitle } from "@/views/role-play/ui/ready/RolePlayReadySectionTitle";

export function RolePlayReadyEvaluationSection() {
  const evaluationMode = useRolePlayReadyStore((state) => state.settings.evaluationMode);

  return (
    <section className="flex flex-col gap-5">
      <RolePlayReadySectionTitle
        title="평가 모드"
        description="얼마나 엄격하게 비교할지 골라보세요. 틀려도 괜찮아요."
      />
      <div className="grid gap-3" role="radiogroup" aria-label="평가 방식 상세 선택">
        {ROLE_PLAY_READY_EVALUATION_MODES.map((option) => (
          <SelectableOptionCard
            key={option.value}
            role="radio"
            aria-checked={evaluationMode === option.value}
            selected={evaluationMode === option.value}
            className="min-h-20 px-5 py-4"
            icon={option.value === "exact" ? <Target /> : <MessageSquare />}
            title={option.title}
            description={option.description}
            onClick={() => useRolePlayReadyStore.getState().setEvaluationMode(option.value)}
          />
        ))}
      </div>
    </section>
  );
}
