import { ErrorPopupProvider, errorPopupManager } from "@/shared/lib/error-popup";
import { rolePlayLibraryHeader } from "@/views/role-play/config/libraryHeader";
import { memorizationLibraryHeader } from "@/views/memorization/config/libraryHeader";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor, mocked } from "storybook/test";
import Link from "next/link";
import { createRolePlaySession } from "@/views/role-play/services/action/createRolePlaySession";
import { createMemorizationSession } from "@/views/memorization/services/action/createMemorizationSession";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { useSuggestMemorizationParagraphs } from "@/features/memorization-paragraph-suggestion/services/hooks/useSuggestMemorizationParagraphs";
import { saveRolePlayMaterial } from "@/views/role-play/services/action/saveRolePlayMaterial";
import { saveMemorizationMaterial } from "@/views/memorization/services/action/saveMemorizationMaterial";
import { EditorialShell } from "@/widgets/editorial-shell/ui/EditorialShell";
import { PageContainer } from "@/widgets/app-shell";
import { HomeView } from "@/views/home/ui/HomeView";
import {
  MyPageContent,
  MyPageMaterialRows,
  MyPageHistoryRows,
} from "@/views/my-page/ui/MyPageContent";
import { RolePlayEditorClient } from "@/views/role-play/ui/editor/RolePlayEditorClient";
import { MemorizationEditorClient } from "@/views/memorization/ui/editor/MemorizationEditorClient";
import { MaterialLibraryHeader } from "@/widgets/material-library/ui/MaterialLibraryHeader";
import { SourceCard } from "@/widgets/source-card/ui/SourceCard";
import { TagChip } from "@/shared/components";
import { ManagementRecordsView } from "@/views/management-records/ui/ManagementRecordsView";
import { LatestSessionsView } from "@/views/latest-sessions/ui/LatestSessionsView";
import { ROLE_PLAY_INNER_MENU_ITEMS } from "@/views/role-play/config/const";
import { RolePlayReadyClient } from "@/views/role-play/ui/ready/RolePlayReadyClient";
import { MemorizationReadyContent } from "@/views/memorization/ui/ready/MemorizationReadyContent";
import { roleplay, memorization, sessions } from "./practiceHubFixtures";

const meta = {
  title: "views/Practice Hub",
  beforeEach: () => {
    errorPopupManager.close();
    mocked(createRolePlaySession).mockResolvedValue({ code: "SUCCESS", sessionId: "preview" });
    mocked(createMemorizationSession).mockResolvedValue({ code: "SUCCESS", sessionId: "preview" });
    mocked(useSuggestMemorizationParagraphs).mockImplementation((onSuggested) => ({
      isPending: false,
      suggest: (text) =>
        onSuggested({
          paragraphs: text
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((text, index) => ({
              order: index + 1,
              sentences: [{ order: 1, text, translation: null }],
            })),
        }),
    }));
    mocked(saveRolePlayMaterial).mockResolvedValue({
      code: "SUCCESS",
      materialId: "preview-material",
    });
    mocked(saveMemorizationMaterial).mockResolvedValue({
      code: "SUCCESS",
      materialId: "preview-material",
    });
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <ErrorPopupProvider />
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/home" } },
    a11y: { test: "error" },
    viewport: {
      options: {
        desktop: { name: "Desktop", styles: { width: "1440px", height: "1000px" } },
        mobile: { name: "Mobile", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet", styles: { width: "834px", height: "1112px" } },
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Library({
  type,
  navigate,
}: {
  type: "roleplay" | "memorization";
  navigate: (path: string) => void;
}) {
  const [tag, setTag] = useState("전체");
  const base = type === "roleplay" ? "/role-playing" : "/sentence-memorization";
  const items = type === "roleplay" ? roleplay : memorization;
  return (
    <PageContainer>
      <section className="flex flex-col gap-8">
        <MaterialLibraryHeader
          {...(type === "roleplay" ? rolePlayLibraryHeader : memorizationLibraryHeader)}
        />
        <nav className="flex gap-2" aria-label="자료 태그 필터">
          {["전체", "일상", "여행"].map((value) => (
            <TagChip key={value} selected={tag === value} onClick={() => setTag(value)}>
              {value}
            </TagChip>
          ))}
        </nav>
        <div className="grid gap-6 md:grid-cols-2">
          {(tag === "여행" ? [] : items).map((item) => (
            <SourceCard
              key={item.id}
              id={item.id}
              title={item.title}
              subTitle={item.description}
              tags={[{ label: "일상", value: "daily" }]}
              theme="black"
              contentValue={type === "roleplay" ? 8 : 3}
              href={`${base}/${item.id}/ready`}
              innerMenuItems={ROLE_PLAY_INNER_MENU_ITEMS.filter((item) => item.value === "edit")}
              onMenuAction={(_, id) => navigate(`${base}/${id}/edit`)}
            />
          ))}
        </div>
        {tag === "여행" && <p className="py-12 text-gray-text">해당 태그의 자료가 없어요.</p>}
      </section>
    </PageContainer>
  );
}
const roleDraft = {
  title: "Ordering at a Cafe",
  situation: "카페에서 음료 주문하기",
  tags: ["일상", "카페"],
  lines: [
    { id: "partner", speaker: "partner" as const, text: "Hi! What can I get for you?" },
    { id: "me", speaker: "me" as const, text: "Could I have a latte, please?" },
  ],
};
const memoDraft = {
  title: "A Small Daily Habit",
  tags: ["일상", "습관"],
  rawText:
    "Small habits can make a big difference. I try to read a few pages every morning.\n\nAt first, it was difficult to stay consistent. Now it feels like a natural part of my day.",
  paragraphs: [
    "Small habits can make a big difference. I try to read a few pages every morning.",
    "At first, it was difficult to stay consistent. Now it feels like a natural part of my day.",
  ],
  confirmed: false,
};

function Walkthrough({
  initialPath = "/home",
  populated = false,
}: {
  initialPath?: string;
  populated?: boolean;
}) {
  const [path, setPath] = useState(initialPath);
  useEffect(() => {
    getRouter().push.mockImplementation((href) => {
      setPath(href);
    });
    return () => {
      getRouter().push.mockReset();
    };
  }, []);
  let content;
  if (path === "/home") content = <HomeView />;
  else if (path === "/my-page")
    content = (
      <MyPageContent
        roleplay={<MyPageMaterialRows items={roleplay} />}
        memorization={<MyPageMaterialRows items={memorization} />}
        history={<MyPageHistoryRows sessions={sessions} />}
      />
    );
  else if (path === "/sessions")
    content = (
      <PageContainer>
        <LatestSessionsView
          sessions={sessions}
          totalPages={1}
          totalCount={2}
          query={{ page: 1, status: "all", sort: "newest" }}
        />
      </PageContainer>
    );
  else if (path === "/recording-management")
    content = (
      <PageContainer>
        <ManagementRecordsView
          records={[]}
          recordsSummary={{ total: 0, connected: 0, orphaned: 0, failDelete: 0 }}
          query={{ page: 1, status: "all", sort: "newest" }}
          totalCount={0}
          totalPages={0}
        />
      </PageContainer>
    );
  else if (path.endsWith("/new") || path.endsWith("/edit"))
    content = (
      <PageContainer>
        {path.startsWith("/role-playing") ? (
          <RolePlayEditorClient
            key={path}
            mode={path.endsWith("/edit") ? "edit" : "create"}
            materialId={path.endsWith("/edit") ? "cafe" : undefined}
            initialDraft={populated || path.endsWith("/edit") ? roleDraft : undefined}
          />
        ) : (
          <MemorizationEditorClient
            key={path}
            mode={path.endsWith("/edit") ? "edit" : "create"}
            materialId={path.endsWith("/edit") ? "habit" : undefined}
            initialDraft={populated || path.endsWith("/edit") ? memoDraft : undefined}
          />
        )}
      </PageContainer>
    );
  else if (path.includes("/session/") || path.endsWith("/result"))
    content = (
      <PageContainer>
        <h1 className="text-2xl font-medium">디자인 미리보기</h1>
        <p className="mt-4 text-gray-text">
          이번 미리보기에서는 자료 작성과 화면 이동을 확인할 수 있어요. 실제 녹음과 분석은 앱에서
          이용해주세요.
        </p>
        <Link className="mt-6 inline-flex underline" href="/home">
          연습 선택으로 돌아가기
        </Link>
      </PageContainer>
    );
  else if (path.endsWith("/ready"))
    content = (
      <PageContainer className="mx-auto flex max-w-3xl flex-col gap-10">
        {path.startsWith("/role-playing") ? (
          <RolePlayReadyClient
            material={{
              id: "cafe",
              title: "Ordering at a Cafe",
              description: "카페에서 주문하는 대화를 연습해요.",
              tags: ["일상"],
              lineCount: 8,
              learnerTurnCount: 4,
              estimatedMinutes: 3,
            }}
          />
        ) : (
          <MemorizationReadyContent
            material={{
              id: "habit",
              title: "A Small Daily Habit",
              description: "작은 습관이 만드는 변화",
              tags: ["일상"],
              paragraphCount: 3,
              wordCount: 60,
              estimatedMinutes: 3,
              difficulty: "easy",
            }}
          />
        )}
      </PageContainer>
    );
  else
    content = (
      <Library
        key={path}
        type={path.startsWith("/role-playing") ? "roleplay" : "memorization"}
        navigate={setPath}
      />
    );
  return (
    <div
      onClickCapture={(event) => {
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest("a");
        const href = link?.getAttribute("href");
        if (href?.startsWith("/") && !href.startsWith("//")) {
          event.preventDefault();
          setPath(href);
        }
      }}
    >
      <EditorialShell initials="SJ" pathname={path}>
        {content}
      </EditorialShell>
    </div>
  );
}

export const Home: Story = {
  name: "01 홈 · 연습 선택",
  globals: { viewport: { value: "desktop" } },
  render: () => <Walkthrough />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("complementary")).not.toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: "다음 연습 모드" }));
    await expect(c.getByRole("heading", { name: "문단 암기" })).toBeVisible();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(c.getByRole("heading", { name: "롤플레잉" })).toBeVisible();
  },
};
export const RoleplayLibrary: Story = {
  name: "02 롤플레잉 · 자료 목록",
  globals: { viewport: { value: "desktop" } },
  render: () => <Walkthrough initialPath="/role-playing" />,
};
export const RoleplayEditor: Story = {
  name: "03 롤플레잉 · 새 자료",
  globals: { viewport: { value: "desktop" } },
  render: () => <Walkthrough initialPath="/role-playing/new" populated />,
};
export const MemorizationEditor: Story = {
  name: "04 문단 암기 · 새 자료",
  globals: { viewport: { value: "desktop" } },
  render: () => <Walkthrough initialPath="/sentence-memorization/new" populated />,
};
export const MyPage: Story = {
  name: "05 마이페이지",
  globals: { viewport: { value: "desktop" } },
  render: () => <Walkthrough initialPath="/my-page" />,
};
export const Mobile: Story = {
  name: "06 모바일 홈",
  globals: { viewport: { value: "mobile" } },
  render: () => <Walkthrough />,
};
export const MobileEditor: Story = {
  name: "07 모바일 에디터",
  globals: { viewport: { value: "mobile" } },
  render: () => <Walkthrough initialPath="/role-playing/new" populated />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByRole("button", { name: "메뉴 열기" });
    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole("dialog");
    await expect(within(dialog).getByRole("link", { name: "연습 선택으로" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
export const Flow: Story = {
  name: "08 홈 → 자료 → 작성 → 마이페이지",
  globals: { viewport: { value: "desktop" } },
  render: () => <Walkthrough />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("link", { name: "롤플레잉 시작하기" }));
    await expect(c.getByRole("complementary")).toBeVisible();
    await userEvent.click(
      within(c.getByRole("main")).getByRole("link", { name: "새 자료 만들기" }),
    );
    await userEvent.type(c.getByRole("textbox", { name: "제목" }), "My first conversation");
    await userEvent.click(c.getByRole("button", { name: "내 대사" }));
    await userEvent.type(c.getByRole("textbox", { name: "1번째 내 대사" }), "Hello there.");
    await userEvent.click(c.getByRole("button", { name: "1번째 화자 바꾸기" }));
    await expect(c.getByRole("textbox", { name: "1번째 상대방 대사" })).toHaveValue("Hello there.");
    await userEvent.click(c.getByRole("button", { name: "취소" }));
    const dialog = await within(document.body).findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "나가기" }));
    await waitFor(() => expect(c.getByRole("heading", { name: "롤플레잉" })).toBeVisible());
    await userEvent.click(
      within(c.getByRole("navigation", { name: "상단 메뉴" })).getByRole("link", {
        name: "마이페이지",
      }),
    );
    await expect(c.getByRole("heading", { name: "최근 학습 기록" })).toBeVisible();
    await expect(c.queryByRole("complementary")).not.toBeInTheDocument();
    await userEvent.click(c.getByRole("link", { name: "Echo 홈" }));
    await expect(c.getByRole("heading", { name: "오늘은 어떻게 연습할까요?" })).toBeVisible();
  },
};

export const RoleplaySaveFailure: Story = {
  name: "09 롤플레잉 · 저장 실패 시 입력 보존",
  globals: { viewport: { value: "desktop" } },
  render: () => <Walkthrough initialPath="/role-playing/cafe/edit" populated />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    mocked(saveRolePlayMaterial).mockRejectedValueOnce(new Error("Network unavailable"));
    await userEvent.click(c.getByRole("button", { name: "저장" }));
    const popup = await within(document.body).findByRole("alertdialog");
    await waitFor(() => expect(within(popup).getByText("저장에 실패했습니다")).toBeVisible());
    await userEvent.click(within(popup).getByRole("button", { name: "확인" }));
    await waitFor(() =>
      expect(within(document.body).queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(c.getByRole("textbox", { name: "제목" })).toHaveValue("Ordering at a Cafe"),
    );
    await expect(c.getByRole("textbox", { name: "2번째 내 대사" })).toHaveValue(
      "Could I have a latte, please?",
    );
    await userEvent.click(c.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(c.getByRole("heading", { name: "롤플레잉" })).toBeVisible());
    await expect(saveRolePlayMaterial).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Ordering at a Cafe" }),
      "cafe",
    );
  },
};
export const RoleplayInvalidSave: Story = {
  name: "10 롤플레잉 · 빈 자료 저장 차단",
  render: () => <Walkthrough initialPath="/role-playing/new" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    mocked(saveRolePlayMaterial).mockClear();
    await userEvent.click(c.getByRole("button", { name: "저장" }));
    const popup = await within(document.body).findByRole("alertdialog");
    await waitFor(() => expect(within(popup).getByText("제목을 입력해주세요")).toBeVisible());
    await expect(saveRolePlayMaterial).not.toHaveBeenCalled();
    await userEvent.click(within(popup).getByRole("button", { name: "확인" }));
    await waitFor(() =>
      expect(within(document.body).queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  },
};
