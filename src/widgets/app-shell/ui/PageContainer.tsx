import * as React from "react";

// shared
import { cn } from "@/shared/lib/tailwind/utils";

export interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * 셸 안쪽 콘텐츠의 가로 폭과 여백을 맞추는 래퍼.
 *
 * 페이지마다 max-width 와 padding 을 각자 정하면 화면 간 정렬이 어긋나므로
 * 여기 한 곳에서만 정합니다. 내비게이션과 동일한 page 폭·여백 토큰을 씁니다.
 */
export const PageContainer = ({
  children,
  className,
  ...props
}: PageContainerProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-page flex-1 flex-col px-page-gutter pt-10 pb-section",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
