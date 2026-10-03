import { composeStories, type Meta, type StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/shared/components";
import { AppShell, PageContainer } from "@/widgets/app-shell";
import { RolePlayEditorClient } from "@/views/role-play/ui/editor/RolePlayEditorClient";
import { MemorizationEditorClient } from "@/views/memorization/ui/editor/MemorizationEditorClient";
import { SourceCardsWrapper as RoleplayCards } from "@/views/role-play/ui/view/SourceCardsWrapper";
import { SourceCardsWrapper as MemorizationCards } from "@/views/memorization/ui/view/SourceCardsWrapper";
import { RolePlayTagFilterList } from "@/views/role-play/ui/view/RolePlayTagFilter";
import { MemorizationTagFilterList } from "@/views/memorization/ui/view/MemorizationTagFilter";
import { TestAnalysisView } from "@/views/test/ui/TestAnalysisView";
import NotFound from "@/app/not-found";
import * as pageStories from "./PageDesign.stories";
import * as shellStories from "../widgets/app-shell/ui/AppShell.stories";
import * as callbackStories from "./callback/AuthCallbackContent.stories";
import * as roleplayStories from "./recording/role-play/ui/RolePlayRecordingView.stories";
import * as memoStories from "./recording/memorization/ui/MemorizationRecordingView.stories";
import * as resultStories from "./analysis-result/ui/AnalysisResultView.stories";
import * as historyStories from "./latest-sessions/ui/LatestSessionsView.stories";

// Product components with Storybook-only fixtures. Authentication and server writes are not exercised.
const annotations = { parameters: { nextjs: { appDirectory: true } } };
const pages = composeStories(pageStories, annotations);
const shell = composeStories(shellStories, annotations);
const callback = composeStories(callbackStories, annotations);
const roleplay = composeStories(roleplayStories, annotations);
const memo = composeStories(memoStories, annotations);
const results = composeStories(resultStories, annotations);
const history = composeStories(historyStories, annotations);
declare const __ECHO_VIEWPORT_WIDTH__: number;
const reviewWidth = typeof __ECHO_VIEWPORT_WIDTH__ === "undefined" ? 1440 : __ECHO_VIEWPORT_WIDTH__;

const meta = {
  title: "views/Route Gallery",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await Promise.all(
      canvasElement
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
    await waitFor(() => expect(canvas.getByRole("heading", { level: 1 })).toBeVisible());
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const menu = canvas.queryByRole("button", { name: "메뉴 열기" });
    if (menu) {
      await userEvent.click(menu);
      const dialog = await within(document.body).findByRole("dialog");
      expect(within(dialog).getByRole("link", { name: "문단 암기" })).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(menu).toHaveFocus());
      expect(menu).toHaveAttribute("aria-expanded", "false");
    }
  },
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    nextjs: { appDirectory: true },
    viewport: {
      defaultViewport: "review",
      viewports: {
        review: { name: "Review", styles: { width: `${reviewWidth}px`, height: "1056px" } },
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const cards = [
  {
    id: "demo-1",
    title: "Ordering at a Cafe",
    subTitle: "카페에서 주문하기",
    tags: [{ value: "일상", label: "일상" }],
    theme: "blue" as const,
    contentValue: 8,
  },
  {
    id: "demo-2",
    title: "A small step, every day",
    subTitle: "매일 조금씩 연습하기",
    tags: [{ value: "여행", label: "여행" }],
    theme: "blue" as const,
    contentValue: 3,
  },
];
const tags = [
  { displayName: "일상", normalizedName: "일상" },
  { displayName: "여행", normalizedName: "여행" },
];
function Library({ memorization = false }: { memorization?: boolean }) {
  const root = memorization ? "/sentence-memorization" : "/role-playing";
  return (
    <AppShell>
      <PageContainer className="gap-7">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-display">{memorization ? "문단 암기" : "롤플레잉"}</h1>
            <p className="mt-4 text-body-4 text-gray-text">연습할 자료를 선택하세요.</p>
          </div>
          <Button asChild size="lg">
            <Link href={`${root}/new`}>+ 새 자료</Link>
          </Button>
        </header>
        {memorization ? (
          <>
            <MemorizationTagFilterList selectedTags={[]} filterTags={tags} />
            <MemorizationCards cards={cards} />
          </>
        ) : (
          <>
            <RolePlayTagFilterList selectedTags={[]} filterTags={tags} />
            <RoleplayCards cards={cards} />
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}

export const Home: Story = { name: "01 홈", render: () => <shell.Overview /> };
export const Login: Story = { name: "02 로그인", render: () => <pages.Login /> };
export const Callback: Story = {
  name: "03 로그인 연결",
  beforeEach: callbackStories.default.beforeEach,
  render: () => <callback.Loading />,
};
export const RoleplayList: Story = {
  name: "04 롤플레잉 목록",
  parameters: { nextjs: { navigation: { pathname: "/role-playing" } } },
  render: () => <Library />,
};
export const RoleplayNew: Story = {
  name: "05 롤플레잉 작성",
  render: () => <pages.RoleplayEditor />,
};
export const RoleplayEdit: Story = {
  parameters: { nextjs: { navigation: { pathname: "/role-playing/demo/edit" } } },
  name: "06 롤플레잉 수정",
  render: () => (
    <AppShell>
      <PageContainer>
        <RolePlayEditorClient
          mode="edit"
          materialId="demo"
          initialDraft={{
            title: "Ordering at a Cafe",
            situation: "카페에서 주문하기",
            tags: ["일상"],
            lines: [
              { id: "1", speaker: "partner", text: "What can I get for you?" },
              { id: "2", speaker: "me", text: "A latte, please." },
            ],
          }}
        />
      </PageContainer>
    </AppShell>
  ),
};
export const RoleplayReady: Story = {
  name: "07 롤플레잉 준비",
  render: () => <pages.RoleplayReady />,
};
export const RoleplaySession: Story = {
  name: "08 롤플레잉 녹음",
  render: () => <roleplay.UserReady />,
};
export const RoleplayResult: Story = { name: "09 롤플레잉 결과", render: () => <results.Done /> };
export const MemorizationList: Story = {
  name: "10 문단 암기 목록",
  parameters: { nextjs: { navigation: { pathname: "/sentence-memorization" } } },
  render: () => <Library memorization />,
};
export const MemorizationNew: Story = {
  name: "11 문단 암기 작성",
  render: () => <pages.MemorizationEditor />,
};
export const MemorizationEdit: Story = {
  parameters: { nextjs: { navigation: { pathname: "/sentence-memorization/demo/edit" } } },
  name: "12 문단 암기 수정",
  render: () => (
    <AppShell>
      <PageContainer>
        <MemorizationEditorClient
          mode="edit"
          materialId="demo"
          initialDraft={{
            title: "A small step, every day",
            tags: ["일상"],
            rawText: "Practice makes progress. Start with one sentence.",
            paragraphs: ["Practice makes progress.", "Start with one sentence."],
            confirmed: false,
          }}
        />
      </PageContainer>
    </AppShell>
  ),
};
export const MemorizationReady: Story = {
  name: "13 문단 암기 준비",
  render: () => <pages.MemorizationReady />,
};
export const MemorizationSession: Story = {
  name: "14 문단 암기 녹음",
  render: () => <memo.UserReady />,
};
export const MemorizationResult: Story = {
  name: "15 문단 암기 결과",
  render: () => (
    <results.Done viewModel={{ ...results.Done.args.viewModel!, kind: "memorization" }} />
  ),
};
export const History: Story = { name: "16 학습 기록", render: () => <history.Default /> };
export const Recordings: Story = {
  name: "17 녹음 관리",
  render: () => <pages.RecordingManagement />,
};
export const DeveloperTest: Story = { name: "18 개발 테스트", render: () => <TestAnalysisView /> };
export const Missing: Story = { name: "19 페이지 없음", render: () => <NotFound /> };
