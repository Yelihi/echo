import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { AppShell } from "@/widgets/app-shell";
import {
  HomeContent,
  HomeMaterialRows,
  HomeHistoryRows,
} from "@/views/home/ui/editorial/HomeContent";
import type { HomeMaterialItem } from "@/views/home/models/interface";
import type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";

const roleplay: HomeMaterialItem[] = [
  {
    id: "cafe",
    title: "Ordering at a Cafe",
    description: "카페에서 주문하기",
    date: new Date("2026-10-03T03:00:00Z"),
    href: "/role-playing/cafe/ready",
  },
  {
    id: "weekend",
    title: "A Weekend Plan",
    description: "주말 계획 이야기하기",
    date: new Date("2026-10-01T03:00:00Z"),
    href: "/role-playing/weekend/ready",
  },
];
const memorization: HomeMaterialItem[] = [
  {
    id: "habit",
    title: "A Small Daily Habit",
    description: "작은 습관이 만드는 변화",
    date: new Date("2026-10-02T03:00:00Z"),
    href: "/sentence-memorization/habit/ready",
  },
  {
    id: "practice",
    title: "The Value of Practice",
    description: "연습의 가치",
    date: new Date("2026-09-30T03:00:00Z"),
    href: "/sentence-memorization/practice/ready",
  },
];
const sessions: GetLatestStudySession[] = [
  {
    id: "cafe-result",
    title: "Ordering at a Cafe",
    sessionDate: new Date("2026-10-03T03:00:00Z"),
    description: "롤플레잉",
    sessionType: "role-playing",
    sessionState: "completed",
    href: "/roleplay-sessions/cafe-result/result",
    actionLabel: "결과 보기",
  },
  {
    id: "habit-session",
    title: "A Small Daily Habit",
    sessionDate: new Date("2026-10-02T03:00:00Z"),
    description: "문단 암기",
    sessionType: "memorization",
    sessionState: "practicing",
    href: "/sentence-memorization/habit/session/habit-session",
    actionLabel: "이어서 연습",
  },
];

const meta = {
  title: "views/Home Fidelity",
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/home" } },
    a11y: { test: "error" },
    viewport: {
      options: {
        reference: { name: "시안 1487 × 1058", styles: { width: "1487px", height: "1058px" } },
        mobile: { name: "모바일 390", styles: { width: "390px", height: "844px" } },
        tablet: { name: "태블릿 834", styles: { width: "834px", height: "1112px" } },
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Screen({ empty = false, long = false }: { empty?: boolean; long?: boolean }) {
  return (
    <AppShell initials="SJ">
      <HomeContent
        date={new Date("2026-10-03T03:00:00Z")}
        roleplay={
          <HomeMaterialRows
            items={
              empty
                ? []
                : long
                  ? roleplay.map((item) => ({
                      ...item,
                      title:
                        "A considerably longer conversation about making plans for next weekend",
                      description: "긴 제목과 설명이 있는 자료도 잘리지 않고 확인할 수 있어요.",
                    }))
                  : roleplay
            }
          />
        }
        memorization={<HomeMaterialRows items={empty ? [] : memorization} />}
        history={<HomeHistoryRows sessions={empty ? [] : sessions} />}
      />
    </AppShell>
  );
}

export const Desktop: Story = {
  name: "01 시안과 같은 홈",
  globals: { viewport: { value: "reference" } },
  render: () => <Screen />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "오늘도 한 문장씩." })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "롤플레잉 연습하기" })).toHaveAttribute(
      "href",
      "/role-playing",
    );
    await expect(canvas.getByRole("link", { name: "문단 암기 연습하기" })).toHaveAttribute(
      "href",
      "/sentence-memorization",
    );
    await expect(
      canvas.getByRole("link", { name: /Ordering at a Cafe · 분석 완료/ }),
    ).toHaveAttribute("href", "/roleplay-sessions/cafe-result/result");
    await expect(
      canvas.getByRole("link", { name: /A Small Daily Habit · 진행 중/ }),
    ).toHaveAttribute("href", "/sentence-memorization/habit/session/habit-session");
    await userEvent.click(canvas.getByRole("button", { name: "프로필 메뉴" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "계정 전환" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "프로필 메뉴" })).toHaveAttribute(
        "aria-expanded",
        "false",
      ),
    );
  },
};
export const Mobile: Story = {
  name: "02 모바일",
  globals: { viewport: { value: "mobile" } },
  render: () => <Screen />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = canvas.getByRole("button", { name: "메뉴 열기" });
    await userEvent.click(menu);
    const dialog = await within(document.body).findByRole("dialog", { name: "Echo 메뉴" });
    await expect(within(dialog).getByRole("link", { name: "문단 암기" })).toHaveAttribute(
      "href",
      "/sentence-memorization",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menu).toHaveFocus());
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
export const Tablet: Story = {
  name: "03 태블릿",
  globals: { viewport: { value: "tablet" } },
  render: () => <Screen />,
};
export const Empty: Story = {
  name: "04 자료 없음",
  globals: { viewport: { value: "reference" } },
  render: () => <Screen empty />,
};
export const LongContent: Story = {
  name: "05 긴 제목",
  globals: { viewport: { value: "mobile" } },
  render: () => <Screen long />,
};
