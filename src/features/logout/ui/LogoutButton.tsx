"use client";

// shared
import { Button } from "@/shared/components";

// features
import { useLogout } from "@/features/logout/services/service/useLogout";
import type { LogoutButtonProps } from "@/features/logout/models/interface";

export function LogoutButton({ children }: LogoutButtonProps) {
  const { isPending, requestLogout } = useLogout();

  return (
    <Button size="lg" className="w-full" loading={isPending} onClick={requestLogout}>
      {isPending ? "로그아웃 중…" : children}
    </Button>
  );
}
