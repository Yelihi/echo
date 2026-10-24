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
        // 검사 도중 Query 의존성을 발견해 페이지 전체가 다시 로드되는 것을 방지한다.
        optimizeDeps: { include: ["@tanstack/react-query", "@tanstack/react-query-devtools"] },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"),
          },
        },
      },
    ],
  },
});
