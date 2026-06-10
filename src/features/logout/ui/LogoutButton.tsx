"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// shared
import { Button } from "@/shared/components";

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
      alert("로그아웃 실패 : " + response.error.message);
    }

    setIsPending(false);
  };

  return (
    <Button size="lg" className="w-full" disabled={isPending} onClick={requestLogout}>
      {isPending ? <Loader2 className="size-20 animate-spin" /> : children}
    </Button>
  );
}
