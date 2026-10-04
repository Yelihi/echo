import type { ReactNode } from "react";

export interface EditorialShellProps {
  children: ReactNode;
  initials?: string;
  pathname: string;
}

export interface PracticeNavigationProps {
  pathname: string;
  base: string;
  mode: string;
  onNavigate?: () => void;
}
export interface PracticeMobileMenuProps {
  pathname: string;
  base: string;
  mode: string;
}
export interface EchoWordmarkProps {
  onNavigate?: () => void;
}
