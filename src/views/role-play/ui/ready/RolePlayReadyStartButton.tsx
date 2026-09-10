"use client";

import { useTransition } from "react";
import { Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";

// shared
import { Button } from "@/shared/components";
import { errorPopupManager } from "@/shared/lib/error-popup";

// views
import { createRolePlaySessionErrorFromCode } from "@/views/role-play/models/errors";
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { createRolePlaySession } from "@/views/role-play/services/action/createRolePlaySession";

interface RolePlayReadyStartButtonProps {
  materialId: string;
}

export function RolePlayReadyStartButton({ materialId }: RolePlayReadyStartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const startSession = () => {
    const { role, evaluationMode, voice, speed } = useRolePlayReadyStore.getState().settings;

    startTransition(async () => {
      const result = await createRolePlaySession({
        materialId,
        role,
        evaluationMode,
        voice,
        speed,
      });

      if (result.code === "SUCCESS") {
        router.push(`/role-playing/${materialId}/session/${result.sessionId}`);
        return;
      }

      const error = createRolePlaySessionErrorFromCode(result.code);
      errorPopupManager.open({
        title: error.title,
        message: error.message,
        code: error.code,
      });
    });
  };

  return (
    <Button
      type="button"
      className="h-9 w-full bg-accent-600 hover:bg-accent-700"
      onClick={startSession}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Play />} 연습 시작하기
    </Button>
  );
}
