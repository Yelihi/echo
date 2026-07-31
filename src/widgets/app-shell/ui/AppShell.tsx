import * as React from "react";

import { cn } from "@/shared/lib/tailwind/utils";
import { NavigationContainer } from "@/widgets/navigation/ui/NavigationContainer";

export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * 로그인 이후 화면들이 공유하는 공통 틀.
 *
 * 상단 내비게이션과 콘텐츠 영역만 제공하며 인증 판단은 하지 않습니다 —
 * 인증은 `app/(protected)/layout.tsx` 가 서버에서 처리합니다.
 *
 * 몰입형 세션(practice) 화면은 내비게이션이 없어야 하므로 이 셸을 쓰지 않고,
 * `(protected)` 밖의 별도 route group 에 둡니다.
 */
export const AppShell = ({
  children,
  className,
  ...props
}: AppShellProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="app-shell"
      className={cn("flex min-h-lvh flex-col bg-gray-background", className)}
      {...props}
    >
      {/* NavigationContainer 가 h-full 이라 높이를 여기서 확정합니다 */}
      <header className="sticky top-0 z-50 h-15.5 shrink-0">
        <NavigationContainer />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};
