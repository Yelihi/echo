import figma from "@figma/code-connect";

import { SegmentedControl, SegmentedControlItem } from "@/shared/components/ui/SegmentedControl";

/**
 * Figma: Echo Design System › SegmentedControl
 *
 * Figma 노드는 세그먼트가 프레임으로 고정돼 있어 프로퍼티로 뽑을 게 없습니다.
 * 항목은 코드에서 조합하므로 대표 사용 예시를 보여줍니다.
 * (Radix single 은 재선택 시 빈 문자열을 보내므로 호출자가 막습니다)
 */
figma.connect(SegmentedControl, "<ECHO_DS>?node-id=30-39", {
  example: () => (
    <SegmentedControl value="roleplay" onValueChange={(next) => next && console.log(next)}>
      <SegmentedControlItem value="roleplay">롤플레이</SegmentedControlItem>
      <SegmentedControlItem value="memo">암기</SegmentedControlItem>
    </SegmentedControl>
  ),
});
