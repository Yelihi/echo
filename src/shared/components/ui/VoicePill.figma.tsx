import figma from "@figma/code-connect";
import { Volume2 } from "lucide-react";

import { VoicePill } from "@/shared/components/ui/VoicePill";

/**
 * Figma: Echo Design System › VoicePill
 */
figma.connect(VoicePill, "<ECHO_DS>?node-id=97-895", {
  props: {
    label: figma.string("Label"),
    sub: figma.string("Sub"),
    selected: figma.enum("Selected", {
      true: true,
      false: false,
    }),
  },
  example: ({ label, sub, selected }) => (
    <VoicePill icon={<Volume2 />} label={label} sub={sub} selected={selected} />
  ),
});
