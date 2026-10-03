"use client";

import { Shuffle } from "lucide-react";

// shared
import { Button } from "@/shared/components";
import { RoleCard } from "@/shared/components/ui";

// views
import { ROLE_PLAY_READY_ROLE_OPTIONS } from "@/views/role-play/config/const";
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { RolePlayReadySectionTitle } from "@/views/role-play/ui/ready/RolePlayReadySectionTitle";

export function RolePlayReadyRoleSection() {
  const selectedRole = useRolePlayReadyStore((state) => state.settings.role);

  return (
    <section className="flex flex-col gap-5">
      <RolePlayReadySectionTitle
        title="역할 선택"
        description="어느 쪽을 맡아 말할지 골라보세요. 상대방 대사는 컴퓨터가 읽어줘요."
      />
      <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="역할 선택">
        {ROLE_PLAY_READY_ROLE_OPTIONS.map((option) => (
          <RoleCard
            key={option.value}
            role="radio"
            aria-checked={selectedRole === option.value}
            selected={selectedRole === option.value}
            className="min-h-28 p-5"
            title={option.title}
            description={option.description}
            onClick={() => useRolePlayReadyStore.getState().setRole(option.value)}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full border-dashed bg-white font-bold text-accent-700"
        onClick={() =>
          useRolePlayReadyStore
            .getState()
            .setRole(selectedRole === "learner" ? "partner" : "learner")
        }
      >
        <Shuffle className="size-[17px]" /> 역할 바꾸기
      </Button>
    </section>
  );
}
