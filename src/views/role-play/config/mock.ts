// mock
import type { SourceCardProps } from "@/widgets/source-card/models/interface";

export const mockSources: Array<Omit<SourceCardProps, "innerMenuItems" | "onMenuAction">> = [
  {
    id: "1",
    tags: [
      {
        label: "일상",
        value: "일상",
      },
      {
        label: "초급",
        value: "초급",
      },
    ],
    title: "Ordering at a Cafe",
    subTitle: "카페에서 주문하기",
    theme: "blue",
    contentValue: 8,
  },
  {
    id: "2",
    tags: [
      {
        label: "여행",
        value: "여행",
      },
      {
        label: "초중급",
        value: "초중급",
      },
    ],
    title: "Airport Immigration",
    subTitle: "공항 입국 심사",
    theme: "blue",
    contentValue: 8,
  },
  {
    id: "3",
    tags: [
      {
        label: "비즈니스",
        value: "비즈니스",
      },
      {
        label: "중급",
        value: "중급",
      },
    ],
    title: "Small Talk with a Coworker",
    subTitle: "직장 동료와 스몰토크",
    theme: "blue",
    contentValue: 6,
  },
  {
    id: "4",
    tags: [
      {
        label: "여행",
        value: "여행",
      },
      {
        label: "초급",
        value: "초급",
      },
    ],
    title: "Hotel Check-in",
    subTitle: "호텔 체크인",
    theme: "blue",
    contentValue: 6,
  },
  {
    id: "5",
    tags: [
      {
        label: "비즈니스",
        value: "비즈니스",
      },
      {
        label: "중상급",
        value: "중상급",
      },
    ],
    title: "Ordering at a Cafe",
    subTitle: "카페에서 주문하기",
    theme: "blue",
    contentValue: 8,
  },
];
