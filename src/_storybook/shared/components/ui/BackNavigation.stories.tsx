import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";

const meta = {
  title: "shared/components/ui/BackNavigation",
  component: BackNavigation,
  args: { href: "/my-page" },
} satisfies Meta<typeof BackNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ParentLink: Story = {};
function LocalStep() {
  const [details, setDetails] = useState(true);
  return details ? (
    <BackNavigation href="/my-page" onBack={() => setDetails(false)} />
  ) : (
    <h2>이전 화면</h2>
  );
}
export const LocalTransition: Story = {
  render: () => <LocalStep />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "뒤로가기" }));
    await expect(canvas.getByRole("heading", { name: "이전 화면" })).toBeVisible();
  },
};
