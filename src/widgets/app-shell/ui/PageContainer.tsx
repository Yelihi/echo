import * as React from "react";

import { cn } from "@/shared/lib/tailwind/utils";

export interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * 셸 안쪽 콘텐츠의 가로 폭과 여백을 맞추는 래퍼.
 *
 * 페이지마다 max-width 와 padding 을 각자 정하면 화면 간 정렬이 어긋나므로
 * 여기 한 곳에서만 정합니다. 내비게이션의 내부 폭(1280)과 같은 값을 씁니다.
 */
export const PageContainer = ({
  children,
  className,
  ...props
}: PageContainerProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="page-container"
      className={cn("mx-auto w-full max-w-320 px-6 pt-10 pb-20", className)}
      {...props}
    >
      {children}
    </div>
  );
};
