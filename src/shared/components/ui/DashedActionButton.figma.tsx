import figma from "@figma/code-connect";
import { Upload } from "lucide-react";

import { DashedActionButton } from "@/shared/components/ui/DashedActionButton";

/**
 * Figma: Echo Design System › DashedActionButton
 * lg 는 롤플레잉 txt 업로드, md 는 문장암기 AI 문단 분리에 씁니다.
 */
figma.connect(DashedActionButton, "<ECHO_DS>?node-id=71-52", {
  props: {
    label: figma.string("Label"),
    size: figma.enum("Size", {
      md: "md",
      lg: "lg",
    }),
  },
  example: ({ label, size }) => (
    <DashedActionButton size={size} icon={<Upload />}>
      {label}
    </DashedActionButton>
  ),
});
