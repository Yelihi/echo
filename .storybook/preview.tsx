import { fn, mocked, sb } from "storybook/test";
import { useLogout } from "../src/features/logout/services/service/useLogout";

import type { Preview } from "@storybook/react";
import { Noto_Sans_KR } from "next/font/google";

import "../src/app/global.css";

// 앱(src/app/layout.tsx)과 동일한 폰트를 적용해야 스토리북 렌더링이
// 실제 화면과 일치합니다.
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

// Storybook must never sign out a real account or require Supabase credentials.
sb.mock(import("../src/features/logout/services/service/useLogout.ts"));

const preview: Preview = {
  beforeEach: () => {
    mocked(useLogout).mockReturnValue({ isPending: false, requestLogout: fn(async () => {}) });
  },
  parameters: {
    nextjs: { appDirectory: true },
    options: { storySort: { order: ["foundations", "shared", "widgets", "views"] } },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        app: { name: "App", value: "#f9f9f9" },
        card: { name: "Paper", value: "#ffffff" },
        silver: { name: "Silver", value: "#b6bec6" },
        session: { name: "Session", value: "#1e1d1d" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "card" },
    pillar: "roleplay",
  },
  globalTypes: {
    pillar: {
      description: "필라 호환성 확인 — 두 모드 모두 Silver & Ink 팔레트를 사용합니다",
      toolbar: {
        title: "Pillar",
        icon: "circlehollow",
        items: [
          { value: "roleplay", title: "Roleplay" },
          { value: "memo", title: "Memorization" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div
        className={`${notoSansKR.variable} ${notoSansKR.className} font-sans text-black-primary`}
        data-pillar={context.globals.pillar === "memo" ? "memo" : undefined}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
