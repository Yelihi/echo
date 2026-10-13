import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import type { MemorizationReadyMaterial } from "@/features/memorization-sessions/models/ready";
import { MemorizationRecordingView } from "@/views/recording/ui/memorization/MemorizationRecordingView";

const material: MemorizationReadyMaterial = {
  id: "11111111-1111-4111-8111-111111111111",
  tags: ["Speech", "Daily"],
  title: "Daily Speaking",
  description: "English is a daily habit.",
  paragraphCount: 2,
  wordCount: 10,
  estimatedMinutes: 1,
  difficulty: "Daily",
  previewLines: [
    { label: "문단 1", text: "English is a daily habit. I practice every morning." },
    { label: "문단 2", text: "Small steps make a difference. I keep learning every day." },
  ],
};

const meta = {
  title: "views/recording/memorization/ui/MemorizationRecordingView",
  component: MemorizationRecordingView,
  globals: {
    backgrounds: { value: "session" },
  },
  args: {
    material,
    // This adapter simulates persistence only in Storybook.
    saveRecording: fn(async () => {}),
  },
} satisfies Meta<typeof MemorizationRecordingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getByText(
          "60초 안에 문단 녹음을 마쳐 주세요. 시간이 초과되면 녹음은 삭제되며 분석되지 않습니다.",
        ),
      ).toBeVisible(),
    );
    await expect(
      canvas.getByText("문단 전체를 분석하므로 결과가 나오기까지 시간이 걸릴 수 있습니다."),
    ).toBeVisible();
  },
};
export const Preview: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "단락 미리 보기" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText("문단 2", { exact: false })).toBeVisible());
  },
};

export const UserReady: Story = {
  args: { initialPhase: "user-ready" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("남은 시간 01:00")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "녹음 시작" })).toBeEnabled();
  },
};

export const Recording: Story = {
  args: { initialPhase: "recording" },
};

export const Recorded: Story = {
  args: { initialPhase: "recorded" },
};
