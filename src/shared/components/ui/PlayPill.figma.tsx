import figma from "@figma/code-connect";

import { PlayPill } from "@/shared/components/ui/PlayPill";

/**
 * Figma: Echo Design System › PlayPill
 *
 * playing / progress 는 Figma 에 축이 없습니다 — 런타임 상태라 호출자가 소유합니다.
 * duration 은 이미 포맷된 문자열입니다.
 */
figma.connect(PlayPill, "<ECHO_DS>?node-id=33-48", {
  props: {
    duration: figma.string("Duration"),
  },
  example: ({ duration }) => <PlayPill duration={duration} progress={0} playing={false} />,
});
