import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { PlayPill } from "@/shared/components/ui/PlayPill";

const meta = {
  title: "shared/components/ui/PlayPill",
  component: PlayPill,
  argTypes: {
    progress: {
      control: { type: "number", min: 0, max: 100, step: 5 },
    },
    playing: {
      control: "boolean",
    },
  },
  args: {
    playing: false,
    progress: 0,
    duration: "0:06",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playing: Story = {
  args: { playing: true, progress: 40 },
};

export const Complete: Story = {
  args: { playing: false, progress: 100, duration: "0:06" },
};

/**
 * 재생 상태는 컴포넌트가 갖지 않습니다 — 호출자가 소유하는 방식을 보여줍니다.
 * duration 도 이미 포맷된 문자열을 넘깁니다.
 */
function PlayPillDemo() {
  const [playing, setPlaying] = React.useState(false);

  return (
    <PlayPill
      playing={playing}
      progress={playing ? 62 : 0}
      duration="1:23"
      onToggle={() => setPlaying((previous) => !previous)}
    />
  );
}

export const Interactive: Story = {
  render: () => <PlayPillDemo />,
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <PlayPill {...args} progress={0} />
      <PlayPill {...args} playing progress={40} />
      <PlayPill {...args} progress={100} />
    </div>
  ),
};
