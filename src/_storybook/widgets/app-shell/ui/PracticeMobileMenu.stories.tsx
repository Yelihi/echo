import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { PracticeMobileMenu } from "@/widgets/app-shell/ui/PracticeMobileMenu";
const meta = {
  title: "widgets/app-shell/ui/PracticeMobileMenu",
  component: PracticeMobileMenu,
  args: { pathname: "/role-playing/new", base: "/role-playing", mode: "롤플레잉" },
  decorators: [
    (Story) => (
      <div className="p-6 [&>button]:grid">
        <Story />
      </div>
    ),
  ],
  parameters: { a11y: { test: "error" } },
} satisfies Meta<typeof PracticeMobileMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "메뉴 열기" });
    await userEvent.click(trigger);
    await expect(body.getByRole("dialog", { name: "Echo 메뉴" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(body.getByRole("link", { name: "연습 선택으로" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
