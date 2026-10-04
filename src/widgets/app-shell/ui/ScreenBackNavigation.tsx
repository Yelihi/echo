"use client";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import { isTransientScreen } from "../models/screenNavigation";
import { useScreenTrail } from "../services/useScreenTrail";

export function ScreenBackNavigation({ pathname }: { pathname: string }) {
  const href = useScreenTrail(pathname);
  // Editors and recording screens own their guarded exit controls.
  if (pathname === "/home" || isTransientScreen(pathname)) return null;
  return (
    <nav
      aria-label="이전 화면"
      className="mx-auto max-w-[1440px] px-11 pt-4 max-lg:px-7 max-compact:px-5"
    >
      <BackNavigation href={href} />
    </nav>
  );
}
