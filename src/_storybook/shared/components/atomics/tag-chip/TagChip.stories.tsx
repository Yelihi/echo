import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { TagChip } from "@/shared/components/atomics/tag-chip/TagChip";

type TagChipStoryArgs = {
  disabled: boolean;
};

const TAGS = ["전체", "일상", "비즈니스", "여행", "면접"];

const meta = {
  title: "shared/components/atomics/tag-chip/TagChip",
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: {
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<TagChipStoryArgs>;

export default meta;
type Story = StoryObj<TagChipStoryArgs>;

/** 선택 상태는 호출자가 소유합니다 — 단일/다중 선택 여부도 호출자가 정합니다. */
function TagFilterDemo({ disabled }: TagChipStoryArgs) {
  const [active, setActive] = React.useState(TAGS[0]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TAGS.map((tag) => (
        <TagChip
          key={tag}
          selected={active === tag}
          disabled={disabled}
          onClick={() => setActive(tag)}
        >
          {tag}
        </TagChip>
      ))}
    </div>
  );
}

export const Unselected: Story = {
  render: () => <TagChip>일상</TagChip>,
};

export const Selected: Story = {
  render: () => <TagChip selected>일상</TagChip>,
};

/** 실제 목록 화면의 태그 필터 사용 예시 */
export const TagFilter: Story = {
  render: (args) => <TagFilterDemo {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <TagFilterDemo {...args} />,
};
