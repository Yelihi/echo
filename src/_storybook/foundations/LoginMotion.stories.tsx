import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LoginLayout from "@/app/(auth)/login/layout";

const meta = {
  title: "foundations/Login Motion",
  component: LoginLayout,
  parameters: { layout: "fullscreen" },
  args: { children: <h1 className="z-10 text-heading-lg font-bold">Echo</h1> },
} satisfies Meta<typeof LoginLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPaint: Story = {};
