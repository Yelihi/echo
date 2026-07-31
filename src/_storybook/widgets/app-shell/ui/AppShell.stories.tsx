import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { PageContainer } from "@/widgets/app-shell/ui/PageContainer";

/** 셸 자체를 보여주는 게 목적이라 콘텐츠는 최소한으로 둡니다. */
function ContentBlock({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-card-line bg-card-surface p-5 shadow-emphasize">
      <p className="text-body-3 text-gray-text">{label}</p>
    </div>
  );
}

const meta = {
  title: "widgets/app-shell/ui/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    // Profile 이 useRouter 를, NavigationMenuItem 이 usePathname 을 쓰므로
    // App Router 모킹이 필요합니다.
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/home" },
    },
  },
  args: {
    children: (
      <PageContainer>
        <ContentBlock label="페이지 콘텐츠가 여기에 놓입니다." />
      </PageContainer>
    ),
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 인증은 `app/(protected)/layout.tsx` 가 서버에서 처리하므로 셸에는 없습니다. */
export const Default: Story = {};

/** 콘텐츠가 길어도 내비게이션은 상단에 고정됩니다. */
export const LongContent: Story = {
  args: {
    children: (
      <PageContainer>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <ContentBlock key={index} label={`섹션 ${index + 1}`} />
          ))}
        </div>
      </PageContainer>
    ),
  },
};

/** 좁은 화면에서 메뉴는 줄바꿈 없이 가로 스크롤되고 Profile 은 밀려나지 않습니다. */
export const Narrow: Story = {
  globals: {
    viewport: { value: "mobile1" },
  },
};
