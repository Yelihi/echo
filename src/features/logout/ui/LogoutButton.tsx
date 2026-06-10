"use client";

// shared
import { Button } from "@/shared/components";

// features
import { useLogoutSupabaseInClient } from "@/features/logout/services/query/useLogoutSupabaseInClient";
import type { LogoutButtonProps } from "@/features/logout/models/interface";

export function LogoutButton({ children }: LogoutButtonProps) {
  const { handleLogout } = useLogoutSupabaseInClient();

  return <Button onClick={handleLogout}>{children}</Button>;
}
