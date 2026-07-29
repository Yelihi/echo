import figma from "@figma/code-connect";

import { TimerPill } from "@/shared/components/ui/TimerPill";

/**
 * Figma: Echo Design System › TimerPill
 * 이미 포맷된 문자열을 받습니다 — 시간 계산은 호출자 몫입니다.
 */
figma.connect(TimerPill, "<ECHO_DS>?node-id=36-34", {
  props: {
    time: figma.string("Time"),
  },
  example: ({ time }) => <TimerPill>{time}</TimerPill>,
});
