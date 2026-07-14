import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SourceCard } from "@/widgets/source-card/ui/SourceCard";
import { mockSources } from "@/views/role-play/config/mock";
import { ROLE_PLAY_INNER_MENU_ITEMS } from "@/views/role-play/config/const";
import { RolePlayCardActionStrategyRegistry } from "@/views/role-play/services/RolePlayCardActionStrategy";

const registry = new RolePlayCardActionStrategyRegistry({
  onNavigatePatch: (id) => alert(`수정하기: ${id}`),
  onDelete: (id) => alert(`삭제하기: ${id}`),
});

const onMenuAction = (value: string, id: string) => {
  registry.execute(value, id);
};

const meta = {
  title: "widgets/source-card/ui/SourceCard",
  component: SourceCard,
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
    ...mockSources[0],
    innerMenuItems: ROLE_PLAY_INNER_MENU_ITEMS,
    onMenuAction,
  },
};

export const LongTitle: Story = {
  args: {
    ...mockSources[0],
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
    ...mockSources[0],
    innerMenuItems: ROLE_PLAY_INNER_MENU_ITEMS,
    onMenuAction,
  },
  render: () => (
    <div className="grid grid-cols-2 gap-[10px]">
      {mockSources.map((source) => (
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
