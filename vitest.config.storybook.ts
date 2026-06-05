import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          storybookTest({
            configDir: path.resolve(__dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"),
          },
        },
      },
    ],
  },
});
