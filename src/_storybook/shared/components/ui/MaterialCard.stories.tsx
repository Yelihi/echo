import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MoreVertical } from "lucide-react";

import { Chip } from "@/shared/components/atomics/chip/Chip";
import { MaterialCard } from "@/shared/components/ui/MaterialCard";

/** 메뉴는 슬롯이라 동작은 호출자가 소유합니다. */
function MenuButton() {
  return (
    <button
      type="button"
      aria-label="자료 메뉴"
      className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-text transition-colors outline-none hover:bg-gray-background [&_svg]:size-4.5"
    >
      <MoreVertical />
    </button>
  );
}

const meta = {
  title: "shared/components/ui/MaterialCard",
  component: MaterialCard,
  globals: {
    backgrounds: { value: "app" },
  },
  args: {
    title: "카페에서 음료 주문하기",
    subTitle: "바리스타와 주문을 주고받는 짧은 대화입니다.",
    meta: "문장 8개 · 3분",
    tags: (
      <>
        <Chip tone="roleplay">일상</Chip>
        <Chip tone="roleplay">초급</Chip>
      </>
    ),
    menu: <MenuButton />,
  },
  decorators: [
    (Story) => (
      <div className="w-90 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MaterialCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Roleplay: Story = {};

/** 태그 톤을 memo 로 바꾸면 암기 자료가 됩니다 — 톤은 호출자가 정합니다. */
export const Memorization: Story = {
  args: {
    title: "모임 자기소개",
    subTitle: "처음 만난 사람들에게 나를 소개하는 문단입니다.",
    meta: "문단 5개 · 4분",
    tags: (
      <>
        <Chip tone="memo">연설</Chip>
        <Chip tone="memo">중급</Chip>
      </>
    ),
  },
};

export const WithoutMenu: Story = {
  args: { menu: undefined },
};

/** 제목·부제는 2줄까지 표시되고 넘치면 잘립니다. */
export const LongText: Story = {
  args: {
    title: "공항 체크인 카운터에서 수하물을 맡기고 좌석을 요청하는 대화",
    subTitle:
      "카운터 직원과 수하물 무게, 좌석 선호, 환승 정보를 주고받는 상황입니다. 실제 여행에서 자주 쓰는 표현을 모았습니다.",
  },
};

/** 목록 화면에서는 그리드로 놓입니다. */
export const Grid: Story = {
  decorators: [
    (Story) => (
      <div className="w-260 p-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <div className="grid grid-cols-3 gap-5">
      <MaterialCard {...args} />
      <MaterialCard {...args} title="공항 체크인 카운터" meta="문장 12개 · 5분" />
      <MaterialCard {...args} title="호텔 프런트 문의하기" meta="문장 9개 · 4분" />
    </div>
  ),
};
