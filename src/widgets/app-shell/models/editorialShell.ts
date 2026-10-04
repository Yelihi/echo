import type { ReactNode } from "react";

export interface EditorialShellProps {
  children: ReactNode;
  initials?: string;
  pathname: string;
}
