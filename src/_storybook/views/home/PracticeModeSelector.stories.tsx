import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PracticeModeSelector } from "@/views/home/ui/PracticeModeSelector";
const meta = {
  title: "views/home/PracticeModeSelector",
  component: PracticeModeSelector,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1480px] p-6">
        <Story />
      </div>
    ),
  ],
  parameters: { a11y: { test: "error" } },
} satisfies Meta<typeof PracticeModeSelector>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Navigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "다음 연습 모드" }));
    await expect(canvas.getByRole("link", { name: "문단 암기 시작하기" })).toHaveAttribute(
      "href",
      "/sentence-memorization",
    );
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("heading", { name: "롤플레잉", level: 2 })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "02 문단 암기" }));
    await expect(canvas.getByRole("button", { name: "02 문단 암기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
