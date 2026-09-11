import { expect, userEvent, within } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SessionIntroCard } from "@/widgets/session-intro-card/ui/SessionIntroCard";

const meta = {
  title: "widgets/session-intro-card/ui/SessionIntroCard",
  component: SessionIntroCard,
  parameters: { a11y: { test: "error" } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionIntroCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RolePlay: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "시작하기" }));
    await expect(getRouter().push).toHaveBeenCalledWith("/role-playing");
  },
  args: {
    type: "role-play",
    currentSessions: 12,
  },
};

export const Memorization: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "시작하기" }));
    await expect(getRouter().push).toHaveBeenCalledWith("/sentence-memorization");
  },
  args: {
    type: "memorization",
    currentSessions: 8,
  },
};
