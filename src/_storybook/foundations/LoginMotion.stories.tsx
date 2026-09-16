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

    if (reducedMotion) {
      for (const ring of rings) {
        await expect(ring.getAnimations()).toHaveLength(0);
        await expect(Number(getComputedStyle(ring).opacity)).toBeGreaterThan(0);
      }
      return;
    }

    const animations = Array.from(rings, (ring) => ring.getAnimations()[0]);
    for (const animation of animations) {
      await expect(animation).toBeDefined();
      animation.pause();
    }
    const seek = (time: number) => {
      for (const animation of animations) animation.currentTime = time;
      return Array.from(rings, (ring) => Number(getComputedStyle(ring).opacity));
    };
    try {
      await expect(seek(0)).toEqual([0, 0, 0]);
      for (let index = 0; index < rings.length; index++) {
        const opacities = seek(540 + index * 600);
        await expect(opacities[index]).toBeGreaterThan(0.6);
        for (let next = index + 1; next < rings.length; next++) {
          await expect(opacities[next]).toBe(0);
        }
      }
      await expect(seek(3400)).toEqual([0, 0, 0]);
      const repeated = seek(4140);
      await expect(repeated[0]).toBeGreaterThan(0.6);
      await expect(repeated.slice(1)).toEqual([0, 0]);
    } finally {
      for (const animation of animations) {
        animation.currentTime = 0;
        animation.play();
      }
    }
  },
};
