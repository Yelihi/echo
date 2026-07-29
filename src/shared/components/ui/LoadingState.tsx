import * as React from "react";

import { Spinner } from "@/shared/components/atomics/spinner/Spinner";
import { StateLayout } from "@/shared/components/ui/state-layout";

export interface LoadingStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * 로딩 중 안내 화면.
 *
 * "몇 ms 뒤에 보이기" 같은 지연 표시 규칙은 갖지 않습니다 —
 * 언제 띄울지는 호출자가 결정합니다.
 */
export const LoadingState = ({
  title,
  description,
  ...props
}: LoadingStateProps & React.ComponentProps<"div">) => {
  return (
    <StateLayout
      data-slot="loading-state"
      tone="loading"
      illustration={<Spinner />}
      title={title}
      description={description}
      {...props}
    />
  );
};
