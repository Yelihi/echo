import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import LoginLayout from "@/app/(auth)/login/layout";

const meta = {
  title: "foundations/Login Motion",
  component: LoginLayout,
  parameters: { layout: "fullscreen" },
  args: { children: <h1 className="z-10 text-heading-lg font-bold">Echo</h1> },
} satisfies Meta<typeof LoginLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPaint: Story = {
  play: async ({ canvasElement }) => {
    const rings = canvasElement.querySelectorAll<HTMLElement>(".animate-login-ring");
    await expect(rings).toHaveLength(3);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (const ring of rings) {
      const [animation] = ring.getAnimations();
      if (reducedMotion) {
        await expect(animation).toBeUndefined();
        await expect(Number(getComputedStyle(ring).opacity)).toBeGreaterThan(0);
        continue;
      }

      await expect(animation).toBeDefined();
      animation.pause();
      try {
        animation.currentTime = 0;
        const initial = getComputedStyle(ring).transform;
        await expect(Number(getComputedStyle(ring).opacity)).toBeGreaterThan(0.05);
        animation.currentTime = 500;
        await expect(getComputedStyle(ring).transform).not.toBe(initial);
      } finally {
        animation.play();
      }
    }
  },
};
