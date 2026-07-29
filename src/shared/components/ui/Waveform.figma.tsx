import figma from "@figma/code-connect";

import { Waveform } from "@/shared/components/ui/Waveform";

/**
 * Figma: Echo Design System › Waveform
 * 막대 높이(levels)는 런타임 오디오 값이라 Figma 축이 없습니다.
 */
figma.connect(Waveform, "<ECHO_DS>?node-id=36-21", {
  example: () => <Waveform />,
});
