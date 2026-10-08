"use client";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import { isTransientScreen } from "../models/screenNavigation";
import { useScreenTrail } from "../services/useScreenTrail";

export function ScreenBackNavigation({ pathname }: { pathname: string }) {
  const href = useScreenTrail(pathname);
  const root = pathname.split("/").filter(Boolean)[0];
  // 공통 뒤로가기는 목록의 검색 조건과 저장 전 이탈 확인을 우회하므로, 어법 화면의 이동 제어를 사용한다.
  if (root === "grammar" || root === "grammar-sessions") return null;
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
