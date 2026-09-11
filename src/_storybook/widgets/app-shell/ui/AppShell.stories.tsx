import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { PageContainer } from "@/widgets/app-shell/ui/PageContainer";
import { SessionIntroCard } from "@/widgets/session-intro-card/ui/SessionIntroCard";
import { ListContainer } from "@/widgets/latest-sources/ui/ListContainer";
import { SourceItem } from "@/widgets/latest-sources/ui/SourceItem";
import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";
import { MessageSquare, Layers } from "lucide-react";

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

/** 실제 위젯을 조합해 셸의 여백과 정보 밀도를 확인합니다. */
export const Overview: Story = {
  parameters: { a11y: { test: "error" } },
  args: {
    children: (
      <PageContainer className="gap-10">
        <div>
          <p className="mb-3 text-subtitle-sm font-medium tracking-widest text-gray-text">
            YOUR DAILY PRACTICE
          </p>
          <h1 className="break-keep text-display">오늘도, 한 문장 더.</h1>
          <p className="mt-4 text-body-5 text-gray-text">
            대화로 익히고, 반복으로 나만의 표현을 만드세요.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SessionIntroCard type="role-play" currentSessions={12} />
          <SessionIntroCard type="memorization" currentSessions={8} />
        </div>
        <div className="grid items-start gap-6 md:grid-cols-2">
          <ListContainer type="role-play" icon={MessageSquare} title="최근 추가한 자료">
            <SourceItem
              icon={MessageSquare}
              type="role-play"
              title="카페에서 주문하기"
              subTitle="롤플레잉 · 대사 8개"
              href="/role-playing"
            />
            <SourceItem
              icon={Layers}
              type="memorization"
              title="나를 소개하는 짧은 문장"
              subTitle="문장 암기 · 문단 3개"
              href="/sentence-memorization"
            />
          </ListContainer>
          <section className="flex min-w-0 flex-col gap-4" aria-label="최근 학습 기록">
            <h2 className="text-heading-xs font-bold">최근 학습 기록</h2>
            <SessionSimplified
              title="호텔에서 체크인하기"
              sessionDate={new Date("2026-09-11T00:00:00Z")}
              description="롤플레잉 연습"
              sessionType="role-playing"
              sessionState="completed"
              href="/sessions"
            />
            <SessionSimplified
              title="회의에서 의견 나누기"
              sessionDate={new Date("2026-09-10T00:00:00Z")}
              description="분석 대기"
              sessionType="memorization"
              sessionState="pending"
              disabled
            />
          </section>
        </div>
      </PageContainer>
    ),
  },
};

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
