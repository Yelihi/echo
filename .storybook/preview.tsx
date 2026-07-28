import type { Preview } from "@storybook/react";
import { Noto_Sans_KR } from "next/font/google";

import "../src/app/global.css";

// 앱(src/app/layout.tsx)과 동일한 폰트를 적용해야 스토리북 렌더링이
// 실제 화면 및 Figma 디자인 시스템과 일치합니다.
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        app: { name: "App", value: "#f2f4f6" },
        card: { name: "Card", value: "#ffffff" },
        session: { name: "Session", value: "#141a24" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "card" },
  },
  globalTypes: {
    pillar: {
      description: "활성 필라 — accent 토큰이 따라 전환됩니다",
      toolbar: {
        title: "Pillar",
        icon: "circlehollow",
        items: [
          { value: "roleplay", title: "Roleplay (blue)" },
          { value: "memo", title: "Memorization (navy)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div
        className={notoSansKR.className}
        data-pillar={context.globals.pillar === "memo" ? "memo" : undefined}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
