import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/shared/components/atomics/button/Button";
import { ErrorState } from "@/shared/components/ui/ErrorState";

const meta = {
  title: "shared/components/ui/ErrorState",
  component: ErrorState,
  args: {
    title: "불러오지 못했어요",
    description: "네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
  },
  decorators: [
    (Story) => (
      <div className="w-110 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 재시도 로직은 호출자가 갖습니다. Figma 기준 버튼은 outline 입니다. */
export const WithAction: Story = {
  args: {
    action: (
      <Button variant="outline" size="lg">
        <RefreshCw />
        다시 시도
      </Button>
    ),
  },
};

export const WithoutDescription: Story = {
  args: { description: undefined },
};

export const CustomIcon: Story = {
  args: {
    icon: <WifiOff />,
    title: "연결이 끊겼어요",
    description: "인터넷 연결을 확인해 주세요.",
  },
};
