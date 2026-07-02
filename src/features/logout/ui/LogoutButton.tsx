"use client";

import { Loader2 } from "lucide-react";

// shared
import { Button } from "@/shared/components";

// features
import { useLogout } from "@/features/logout/services/service/useLogout";
import type { LogoutButtonProps } from "@/features/logout/models/interface";

export function LogoutButton({ children }: LogoutButtonProps) {
  const { isPending, requestLogout } = useLogout();

  return (
    <Button size="lg" className="w-full" disabled={isPending} onClick={requestLogout}>
      {isPending ? <Loader2 className="size-20 animate-spin" /> : children}
    </Button>
  );
}
