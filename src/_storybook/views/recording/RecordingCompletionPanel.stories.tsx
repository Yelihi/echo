import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RecordingCompletionPanel } from "@/views/recording/ui/common/RecordingCompletionPanel";
import { RecordingSessionView } from "@/views/recording/ui/common/RecordingSessionView";

const meta = {
  title: "views/recording/RecordingCompletionPanel",
  component: RecordingCompletionPanel,
  decorators: [
    (Story) => (
      <RecordingSessionView pillar="roleplay">
        <Story />
      </RecordingSessionView>
    ),
  ],
  args: { resultHref: "/roleplay-sessions/example/result" },
} satisfies Meta<typeof RecordingCompletionPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Completed: Story = {};
export const Completing: Story = {
  args: { resultHref: undefined, status: "submitting", onRetry: () => {} },
};
export const Failed: Story = {
  args: { resultHref: undefined, status: "failed", onRetry: () => {} },
};

export const PendingConfirmation: Story = {
  args: {
    resultHref: undefined,
    status: "idle",
    title: "카페에서 주문하기",
    savedCount: 3,
    onRetry: () => {},
  },
};
