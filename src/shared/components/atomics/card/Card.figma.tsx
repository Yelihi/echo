import figma from "@figma/code-connect";

import { Card } from "@/shared/components/atomics/card/Card";

/**
 * Figma: Echo Design System › Card / CardFlat
 *
 * Figma 는 Card 와 CardFlat 을 별도 컴포넌트로 두지만, 차이가 radius·shadow 뿐이라
 * 코드에서는 variant 하나로 합쳤습니다. 이 매핑은 raised 쪽입니다.
 */
figma.connect(Card, "<ECHO_DS>?node-id=31-2", {
  example: () => <Card className="p-5">콘텐츠</Card>,
});

figma.connect(Card, "<ECHO_DS>?node-id=31-4", {
  example: () => (
    <Card variant="flat" className="p-4">
      콘텐츠
    </Card>
  ),
});
