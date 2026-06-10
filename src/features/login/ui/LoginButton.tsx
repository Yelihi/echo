"use client";

// shared
import { Button } from "@/shared/components";

// feature
import { useAuthWithSupabase } from "@/features/login/services/query/useAuthWithSupabase";
import type { LoginButtonProps } from "@/features/login/models/interface";

export function LoginButton({ children, provider }: LoginButtonProps) {
  const { handleAuthWithSupabase } = useAuthWithSupabase();

  return (
    <Button size="lg" onClick={() => handleAuthWithSupabase(provider)}>
      {children}
    </Button>
  );
}
