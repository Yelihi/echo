import type { SourceCardProps } from "@/widgets/source-card/models/interface";

export const mockMemorizationSources: Array<
  Omit<SourceCardProps, "innerMenuItems" | "onMenuAction">
> = [
  {
    id: "memo-1",
    tags: [
      { label: "스피치", value: "스피치" },
      { label: "중급", value: "중급" },
    ],
    title: "Business Email Openings",
    subTitle: "비즈니스 이메일 첫 문장",
    theme: "black",
    contentValue: 12,
  },
  {
    id: "memo-2",
    tags: [
      { label: "TED", value: "TED" },
      { label: "습관", value: "습관" },
    ],
    title: "The Power of Habit",
    subTitle: "습관의 힘 발췌문",
    theme: "black",
    contentValue: 10,
  },
  {
    id: "memo-3",
    tags: [
      { label: "면접", value: "면접" },
      { label: "고급", value: "고급" },
    ],
    title: "Tell Me About Yourself",
    subTitle: "자기소개 핵심 답변",
    theme: "black",
    contentValue: 8,
  },
];
