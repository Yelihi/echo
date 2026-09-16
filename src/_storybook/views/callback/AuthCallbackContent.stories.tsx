import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, mocked, waitFor, within } from "storybook/test";
import { useAuthWithSupabase } from "@/features/login/services/query/useAuthWithSupabase";
import { AuthCallbackContent } from "@/views/callback/ui/AuthCallbackContent";

const login = fn(async () => ({ data: { provider: "google" as const, url: null }, error: null }));

const meta = {
  title: "views/callback/AuthCallbackContent",
  component: AuthCallbackContent,
  args: { provider: "google" },
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    login.mockClear();
    mocked(useAuthWithSupabase).mockReturnValue({ handleAuthWithSupabase: login });
  },
  decorators: [
    (Story) => (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-background px-6 py-10 text-center">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof AuthCallbackContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("로그인 준비 중이에요");
    await expect(login).toHaveBeenCalledWith("google");
    await waitFor(
      () => {
        const element = canvasElement.querySelector("canvas");
        const pixels = element
          ?.getContext("2d")
          ?.getImageData(0, 0, element.width, element.height).data;
        expect(pixels?.some((value, index) => index % 4 === 3 && value > 0)).toBe(true);
      },
      { timeout: 10000 },
    );
  },
};

export const MissingProvider: Story = {
  args: { provider: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute(
      "href",
      "/login",
    );
    await expect(login).not.toHaveBeenCalled();
  },
};
