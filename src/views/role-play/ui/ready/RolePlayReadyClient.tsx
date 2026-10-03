"use client";

import { useLayoutEffect } from "react";

// views
import type { RoleplayReadyMaterial } from "@/views/role-play/models/interface";
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { RolePlayReadyEvaluationSection } from "@/views/role-play/ui/ready/RolePlayReadyEvaluationSection";
import { RolePlayReadyHero } from "@/views/role-play/ui/ready/RolePlayReadyHero";
import { RolePlayReadyRoleSection } from "@/views/role-play/ui/ready/RolePlayReadyRoleSection";
import { RolePlayReadyStartButton } from "@/views/role-play/ui/ready/RolePlayReadyStartButton";
import { RolePlayReadyVoiceSection } from "@/views/role-play/ui/ready/RolePlayReadyVoiceSection";

interface RolePlayReadyClientProps {
  material: RoleplayReadyMaterial;
}

export function RolePlayReadyClient({ material }: RolePlayReadyClientProps) {
  useLayoutEffect(() => {
    useRolePlayReadyStore.getState().reset();

    return () => useRolePlayReadyStore.getState().reset();
  }, [material.id]);

  return (
    <>
      <RolePlayReadyHero material={material} />
      <RolePlayReadyRoleSection />
      <RolePlayReadyEvaluationSection />
      <RolePlayReadyVoiceSection />
      <RolePlayReadyStartButton materialId={material.id} />
    </>
  );
}
