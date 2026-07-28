import * as React from "react";
import { Inbox } from "lucide-react";

import { StateLayout } from "@/shared/components/ui/state-layout";

export interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 기본 아이콘(Inbox)을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
  /**
   * 하단 액션 슬롯. 문구·핸들러·버튼 종류를 컴포넌트가 정하지 않도록
   * 노드를 그대로 받습니다. Figma 기준은 `<Button size="lg">` 입니다.
   */
  action?: React.ReactNode;
}

/**
 * 목록이 비었을 때 쓰는 안내 화면.
 * 일러스트가 accent 계열이라 `data-pillar="memo"` 안에서는 네이비로 전환됩니다.
 */
export const EmptyState = ({
  title,
  description,
  icon = <Inbox />,
  action,
  ...props
}: EmptyStateProps & React.ComponentProps<"div">) => {
  return (
    <StateLayout
      data-slot="empty-state"
      tone="empty"
      illustration={icon}
      title={title}
      description={description}
      action={action}
      {...props}
    />
  );
};
