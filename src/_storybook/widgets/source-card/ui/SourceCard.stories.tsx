import { expect, fn, userEvent, within } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// widgets
import type { SourceCardProps } from "@/widgets/source-card/models/interface";
import {
  SOURCE_CARD_SKELETON_COUNT,
  SourceCard,
  SourceCardSkeleton,
} from "@/widgets/source-card/ui/SourceCard";

// views
import { ROLE_PLAY_INNER_MENU_ITEMS } from "@/views/role-play/config/const";
const onMenuAction = fn();

const sampleCard: Omit<SourceCardProps, "innerMenuItems" | "onMenuAction"> = {
  id: "11111111-1111-4111-8111-111111111111",
  tags: [
    { label: "일상", value: "일상" },
    { label: "초급", value: "초급" },
  ],
  title: "Ordering at a Cafe",
  subTitle: "카페에서 주문하기",
  theme: "blue",
  contentValue: 8,
};

const sampleCards = [
  sampleCard,
  {
    ...sampleCard,
    id: "22222222-2222-4222-8222-222222222222",
    title: "Airport Immigration",
    subTitle: "공항 입국 심사",
  },
];

const meta = {
  title: "widgets/source-card/ui/SourceCard",
  component: SourceCard,
  parameters: { a11y: { test: "error" } },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SourceCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...sampleCard,
    innerMenuItems: ROLE_PLAY_INNER_MENU_ITEMS,
    onMenuAction,
  },
};

export const LongTitle: Story = {
  args: {
    ...sampleCard,
    title:
      "아주 아주 아주 긴 제목이 두 줄을 넘어가면 어떻게 말줄임표로 처리되는지 확인하기 위한 예시 타이틀입니다",
    subTitle:
      "아주 아주 아주 긴 부제목이 두 줄을 넘어가면 어떻게 말줄임표로 처리되는지 확인하기 위한 예시 부제목입니다",
    innerMenuItems: ROLE_PLAY_INNER_MENU_ITEMS,
    onMenuAction,
  },
};

export const List: Story = {
  args: {
    ...sampleCard,
    innerMenuItems: ROLE_PLAY_INNER_MENU_ITEMS,
    onMenuAction,
  },
  render: () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {sampleCards.map((source) => (
        <SourceCard
          key={source.id}
          {...source}
          innerMenuItems={ROLE_PLAY_INNER_MENU_ITEMS}
          onMenuAction={onMenuAction}
        />
      ))}
    </div>
  ),
};

export const Skeleton: StoryObj = {
  render: () => (
    <div className="w-full max-w-sm">
      <SourceCardSkeleton />
    </div>
  ),
};

export const SkeletonList: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: SOURCE_CARD_SKELETON_COUNT }, (_, index) => (
        <SourceCardSkeleton key={index} />
      ))}
    </div>
  ),
};

export const MenuInteraction: Story = {
  args: {
    ...sampleCard,
    href: "/role-playing",
    innerMenuItems: ROLE_PLAY_INNER_MENU_ITEMS,
    onMenuAction,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "자료 메뉴" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("button", { name: ROLE_PLAY_INNER_MENU_ITEMS[0].text }));
    await expect(onMenuAction).toHaveBeenCalledWith(
      ROLE_PLAY_INNER_MENU_ITEMS[0].value,
      sampleCard.id,
    );
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
