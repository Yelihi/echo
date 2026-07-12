import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MessageSquare, FileText, Layers } from "lucide-react";

import { ListContainer } from "@/widgets/latest-sources/ui/ListContainer";
import { SourceItem } from "@/widgets/latest-sources/ui/SourceItem";
import { SourceItemProps } from "@/widgets/latest-sources/models/interface";

const meta = {
  title: "widgets/latest-sources/ui/ListContainer",
  component: ListContainer,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

const roleplaySourceItem: SourceItemProps[] = [
  {
    icon: MessageSquare,
    type: "role-play",
    title: "Ordering at a Cafe",
    subTitle: "카페에서 주문하기",
  },
  {
    icon: MessageSquare,
    type: "role-play",
    title: "Airport Immigration",
    subTitle: "공항 입국심사",
  },
  {
    icon: MessageSquare,
    type: "role-play",
    title: "Small Talk with a Coworker",
    subTitle: "직장 동료와 스몰토크",
  },
  {
    icon: MessageSquare,
    type: "role-play",
    title: "Hotel Check-in",
    subTitle: "호텔 체크인",
  },
];

const memorizationSourceItem: SourceItemProps[] = [
  {
    icon: FileText,
    type: "memorization",
    title: "The Gettysburg Address (excerpt)",
    subTitle: "게티스버그 연설 (발췌)",
  },
  {
    icon: FileText,
    type: "memorization",
    title: "Daily Standup Update",
    subTitle: "데일리 스탠드업 보고",
  },
  {
    icon: FileText,
    type: "memorization",
    title: "Self-introduction at a Meetup",
    subTitle: "모임 자기소개",
  },
  {
    icon: FileText,
    type: "memorization",
    title: "Asking for Directions",
    subTitle: "길 묻고 설명하기",
  },
];

export const Default: Story = {
  args: {
    type: "role-play",
    icon: MessageSquare, // TODO: 실제 아이콘으로 교체
    title: "최근 추가된 롤플레잉 자료", // TODO
    children: (
      <>
        {roleplaySourceItem.map((item) => (
          <SourceItem
            key={item.title}
            icon={item.icon}
            type={item.type}
            title={item.title}
            subTitle={item.subTitle}
          />
        ))}
      </>
    ),
  },
};

export const Memorization: Story = {
  args: {
    type: "memorization",
    icon: Layers, // TODO: 실제 아이콘으로 교체
    title: "최근 추가된 암기 자료", // TODO
    children: (
      <>
        {memorizationSourceItem.map((item) => (
          <SourceItem
            key={item.title}
            icon={item.icon}
            type={item.type}
            title={item.title}
            subTitle={item.subTitle}
          />
        ))}
      </>
    ),
  },
};
