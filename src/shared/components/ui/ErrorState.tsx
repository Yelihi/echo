import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { StateLayout } from "@/shared/components/ui/state-layout";

export interface ErrorStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 기본 아이콘(TriangleAlert)을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
  /**
   * 하단 액션 슬롯. Figma 기준은 `<Button variant="outline" size="lg">` 입니다.
   * 재시도 로직은 호출자가 갖습니다.
   */
  action?: React.ReactNode;
}

/**
 * 데이터를 불러오지 못했을 때 쓰는 안내 화면.
 * 치명적 오류가 아닌 복구 가능한 상황을 가정해 경고(yellow) 톤을 씁니다.
 */
export const ErrorState = ({
  title,
  description,
  icon = <TriangleAlert />,
  action,
  ...props
}: ErrorStateProps & React.ComponentProps<"div">) => {
  return (
    <StateLayout
      data-slot="error-state"
      tone="error"
      illustration={icon}
      title={title}
      description={description}
      action={action}
      {...props}
    />
  );
};
