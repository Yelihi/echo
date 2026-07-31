import figma from "@figma/code-connect";

import { SourceCard } from "@/widgets/source-card/ui/SourceCard";

/**
 * Figma: Echo Design System › SourceCard
 *
 * 이슈 #31 은 이 역할을 MaterialCard 라 부르지만, 구현은 이 위젯을 정본으로 씁니다.
 * 태그·메뉴가 데이터 배열로 들어오고 메뉴 동작은 onMenuAction 으로 위임됩니다.
 */
figma.connect(SourceCard, "<ECHO_DS>?node-id=46-81", {
  props: {
    title: figma.string("Title"),
    subTitle: figma.string("Subtitle"),
    theme: figma.enum("Theme", {
      "role-play": "blue",
      memorization: "black",
    }),
  },
  example: ({ title, subTitle, theme }) => (
    <SourceCard
      id="material-1"
      title={title}
      subTitle={subTitle}
      theme={theme}
      contentValue={8}
      tags={[{ value: "daily", label: "일상" }]}
      innerMenuItems={[]}
      onMenuAction={() => {}}
    />
  ),
});
