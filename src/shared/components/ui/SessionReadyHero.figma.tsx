import figma from "@figma/code-connect";
import { Clock, MessageCircle, Mic } from "lucide-react";

import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import { SessionReadyHero } from "@/shared/components/ui/SessionReadyHero";

/**
 * Figma: Echo Design System › SessionReadyHero
 * 태그 목록·통계 줄은 슬롯이라 코드에서 조합합니다.
 */
figma.connect(SessionReadyHero, "<ECHO_DS>?node-id=98-63", {
  props: {
    theme: figma.enum("Theme", {
      roleplay: "roleplay",
      memo: "memo",
    }),
    title: figma.string("Title"),
    subtitle: figma.string("Subtitle"),
  },
  example: ({ theme, title, subtitle }) => (
    <SessionReadyHero theme={theme} tags={["일상", "초급"]} title={title} subtitle={subtitle}>
      <StatItem icon={<MessageCircle />} value={6} label="총 대사" />
      <StatItem icon={<Mic />} value={3} label="내 차례" />
      <StatItem icon={<Clock />} value="~5분" label="예상 시간" />
    </SessionReadyHero>
  ),
});
