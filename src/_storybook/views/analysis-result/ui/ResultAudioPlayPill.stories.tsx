import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ResultAudioPlayPill } from "@/views/analysis-result/ui/ResultAudioPlayPill";

const meta = {
  title: "views/analysis-result/ui/ResultAudioPlayPill",
  component: ResultAudioPlayPill,
  args: {
    signedUrl: "https://example.test/audio.wav",
    durationSec: 6,
  },
  decorators: [
    (Story) => (
      <div className="flex justify-end p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResultAudioPlayPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const LongRecording: Story = {
  args: {
    durationSec: 83,
  },
};
