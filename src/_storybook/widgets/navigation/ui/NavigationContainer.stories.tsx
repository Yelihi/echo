import { expect, userEvent, within } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavigationContainer } from "@/widgets/navigation/ui/NavigationContainer";

const meta = {
  title: "widgets/navigation/ui/NavigationContainer",
  component: NavigationContainer,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/home" },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavigationContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "홈" })).toHaveAttribute("aria-current", "page");
    await expect(canvasElement.querySelector("a button")).toBeNull();
    const trigger = canvas.getByRole("button", { name: "프로필 메뉴" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "개인 설정" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("button", { name: "계정 전환" }));
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const Recording: Story = {
  parameters: { nextjs: { navigation: { pathname: "/recording-management" } } },
};
