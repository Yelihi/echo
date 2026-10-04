"use client";

import type { AppShellProps } from "@/widgets/app-shell/models/interface";
import { usePathname } from "next/navigation";
import { EditorialShell } from "@/widgets/editorial-shell/ui/EditorialShell";

/** Authentication is handled by the protected server layout; session routes keep their focused shell. */
export function AppShell({ children, initials }: AppShellProps) {
  const currentPath = usePathname();
  return (
    <EditorialShell initials={initials} pathname={currentPath}>
      {children}
    </EditorialShell>
  );
}
