"use client";
import { useRouter } from "next/navigation";

// shared
import { Button } from "@/shared/components";

import type { LoginButtonProps } from "@/features/login/models/interface";

export function LoginButton({ children, provider }: LoginButtonProps) {
  const router = useRouter();

  const requestLogin = () => {
    router.push(`/callback?provider=${provider}&next=/home`);
  };

  return (
    <Button
      size="lg"
      className="w-full px-[2.6rem] py-[1.6rem] rounded-[15px] text-[17px] font-semibold tracking-tight shadow-sm"
      variant="outline"
      onClick={requestLogin}
    >
      {children}
    </Button>
  );
}
