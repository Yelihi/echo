"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// shared
import { Button } from "@/shared/components";
import { errorPopupManager } from "@/shared/lib/error-popup";

// features
import { useLogoutSupabaseInClient } from "@/features/logout/services/query/useLogoutSupabaseInClient";
import type { LogoutButtonProps } from "@/features/logout/models/interface";

export function LogoutButton({ children }: LogoutButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const { handleLogout } = useLogoutSupabaseInClient();

  const requestLogout = async () => {
    setIsPending(true);

    const response = await handleLogout();

    if (response.error) {
      errorPopupManager.open({
        title: "로그아웃 실패",
        message: "잠시 후 다시 시도해 주세요.",
        code: "AUTH-001",
      });
    }

    setIsPending(false);
  };

  return (
    <Button size="lg" className="w-full" disabled={isPending} onClick={requestLogout}>
      {isPending ? <Loader2 className="size-20 animate-spin" /> : children}
    </Button>
  );
}
