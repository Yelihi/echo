"use client";
import { useRouter } from "next/navigation";

// shared
import { Button } from "@/shared/components";

import type { LoginButtonProps } from "@/features/login/models/interface";

export function LoginButton({ children, provider }: LoginButtonProps) {
  const router = useRouter();

  const requestLogin = () => {
    router.push(`/loading?provider=${provider}&next=/home`);
  };

  return (
    <Button size="lg" className="w-full" onClick={requestLogin}>
      {children}
    </Button>
  );
}
