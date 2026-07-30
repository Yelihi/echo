import figma from "@figma/code-connect";

import { Chip } from "@/shared/components/atomics/chip/Chip";
import { MaterialCard } from "@/shared/components/ui/MaterialCard";

/**
 * Figma: Echo Design System › SourceCard
 *
 * Figma 이름은 SourceCard 이고 이슈 #31 의 용어는 MaterialCard 입니다.
 * 태그와 메뉴는 슬롯이라 코드에서 조합합니다 — 어떤 톤을 쓸지는
 * 필라를 아는 호출자가 정합니다.
 */
figma.connect(MaterialCard, "<ECHO_DS>?node-id=46-81", {
  props: {
    title: figma.string("Title"),
    subTitle: figma.string("Subtitle"),
    meta: figma.string("Meta"),
    tone: figma.enum("Theme", {
      "role-play": "roleplay",
      memorization: "memo",
    }),
  },
  example: ({ title, subTitle, meta, tone }) => (
    <MaterialCard
      title={title}
      subTitle={subTitle}
      meta={meta}
      tags={<Chip tone={tone}>일상</Chip>}
    />
  ),
});
