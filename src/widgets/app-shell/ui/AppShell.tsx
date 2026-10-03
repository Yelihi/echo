"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { EditorialShell } from "@/widgets/editorial-shell/ui/EditorialShell";

export interface AppShellProps {
  children: ReactNode;
  initials?: string;
  /** Allows the isolated UI preview to supply its current route. */
  pathname?: string;
}

/** Authentication is handled by the protected server layout; session routes keep their focused shell. */
export function AppShell({ children, initials, pathname }: AppShellProps) {
  const currentPath = usePathname();
  return (
    <EditorialShell initials={initials} pathname={pathname ?? currentPath}>
      {children}
    </EditorialShell>
  );
}
