import figma from "@figma/code-connect";

import { AddLineButton } from "@/shared/components/ui/AddLineButton";

/**
 * Figma: Echo Design System › AddLineButton
 * 평상시 모습은 같고 hover 시 화자별 강조가 들어옵니다.
 */
figma.connect(AddLineButton, "<ECHO_DS>?node-id=70-38", {
  props: {
    label: figma.string("Label"),
    speaker: figma.enum("Speaker", {
      partner: "partner",
      me: "me",
    }),
  },
  example: ({ label, speaker }) => <AddLineButton speaker={speaker}>{label}</AddLineButton>,
});
