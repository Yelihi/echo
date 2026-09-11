import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import LoginLayout from "@/app/(auth)/login/layout";
import { LoginView } from "@/views/login/ui/LoginView";
import { AppShell, PageContainer } from "@/widgets/app-shell";
import { RolePlayEditorClient } from "@/views/role-play/ui/editor/RolePlayEditorClient";
import { MemorizationEditorClient } from "@/views/memorization/ui/editor/MemorizationEditorClient";
import { RolePlayReadyClient } from "@/views/role-play/ui/ready/RolePlayReadyClient";
import { MemorizationReadyContent } from "@/views/memorization/ui/ready/MemorizationReadyContent";
import RolePlayReadyLayout from "@/app/(session)/role-playing/[id]/ready/layout";
import MemorizationReadyLayout from "@/app/(session)/sentence-memorization/[id]/ready/layout";
import { ManagementRecordsView } from "@/views/management-records/ui/ManagementRecordsView";

const meta = {
  title: "views/Page Design",
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  render: () => (
    <LoginLayout>
      <LoginView />
    </LoginLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Echo" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Google로 시작하기" }));
    await expect(getRouter().push).toHaveBeenCalledWith("/callback?provider=google&next=/home");
  },
};

export const RoleplayEditor: Story = {
  render: () => (
    <AppShell>
      <PageContainer>
        <RolePlayEditorClient
          mode="create"
          initialDraft={{
            title: "Ordering at a Cafe",
            situation: "카페에서 주문하기",
            tags: ["일상", "카페"],
            lines: [
              { id: "partner", speaker: "partner", text: "What can I get for you?" },
              { id: "me", speaker: "me", text: "I'd like an iced latte, please." },
            ],
          }}
        />
      </PageContainer>
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "내 대사" }));
    const line = canvas.getByRole("textbox", { name: "3번째 내 대사" });
    await userEvent.type(line, "Thank you.");
    await expect(line).toHaveValue("Thank you.");
    await userEvent.click(canvas.getByRole("button", { name: "취소" }));
    const dialogElement = await within(document.body).findByRole("alertdialog");
    await waitFor(() => expect(dialogElement).toBeVisible());
    const dialog = within(dialogElement);
    await expect(dialog.getByText("지금까지 입력한 내용은 저장되지 않습니다.")).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "계속 편집" }));
    await waitFor(() =>
      expect(within(document.body).queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await expect(line).toHaveValue("Thank you.");
  },
};

export const MemorizationEditor: Story = {
  render: () => (
    <AppShell>
      <PageContainer>
        <MemorizationEditorClient
          mode="create"
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paragraph = canvas.getByRole("textbox", { name: "문단 1" });
    await userEvent.clear(paragraph);
    await userEvent.type(paragraph, "Every small step matters.");
    await userEvent.click(canvas.getByRole("button", { name: "문단 확정" }));
    await expect(canvas.getByText("확정됨")).toBeVisible();
    await expect(canvas.getByText("Every small step matters.")).toBeVisible();
    await expect(canvas.queryByRole("textbox", { name: "문단 1" })).not.toBeInTheDocument();
  },
};

export const RoleplayReady: Story = {
  render: () => (
    <RolePlayReadyLayout>
      <RolePlayReadyClient
        material={{
          id: "demo",
          tags: ["일상", "카페"],
          title: "Ordering at a Cafe",
          description: "카페에서 원하는 음료를 자연스럽게 주문해 보세요.",
          lineCount: 10,
          learnerTurnCount: 5,
          estimatedMinutes: 3,
        }}
      />
    </RolePlayReadyLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const partner = canvas.getByRole("radio", { name: /상대방 컴퓨터/ });
    await userEvent.click(partner);
    await expect(partner).toHaveAttribute("aria-checked", "true");
    await userEvent.click(canvas.getByRole("button", { name: "역할 바꾸기" }));
    await expect(partner).toHaveAttribute("aria-checked", "false");
    const context = canvas.getByRole("radio", { name: /스크립트 맥락/ });
    await userEvent.click(context);
    await expect(context).toHaveAttribute("aria-checked", "true");
  },
};

export const MemorizationReady: Story = {
  render: () => (
    <MemorizationReadyLayout>
      <MemorizationReadyContent
        material={{
          id: "demo",
          tags: ["일상"],
          title: "A small step, every day",
          description: "오늘의 한 문장을 내 것으로 만들어 보세요.",
          paragraphCount: 3,
          wordCount: 120,
          estimatedMinutes: 4,
          difficulty: "easy",
        }}
      />
    </MemorizationReadyLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole("radio", { name: /제목만 보고 말하기/ });
    await userEvent.click(title);
    await expect(title).toHaveAttribute("aria-checked", "true");
  },
};

export const RecordingManagement: Story = {
  render: () => (
    <AppShell>
      <PageContainer>
        <ManagementRecordsView
          recordsSummary={{ total: 3, connected: 1, failDelete: 1, orphaned: 1 }}
          query={{ page: 1, status: "all", sort: "newest" }}
          totalCount={3}
          totalPages={1}
          records={[
            {
              id: "1",
              name: "cafe-conversation.wav",
              fileSize: "2.4 MB",
              createdAt: "2026.09.11",
              status: "connected",
            },
            {
              id: "2",
              name: "daily-practice.wav",
              fileSize: "1.2 MB",
              createdAt: "2026.09.10",
              status: "orphaned",
            },
            {
              id: "3",
              name: "practice-retry.wav",
              fileSize: "3.1 MB",
              createdAt: "2026.09.09",
              status: "delete-failed",
            },
          ]}
        />
      </PageContainer>
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "cafe-conversation.wav 보호됨" }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "daily-practice.wav 삭제" }));
    const dialogElement = await within(document.body).findByRole("alertdialog");
    await waitFor(() => expect(dialogElement).toBeVisible());
    const dialog = within(dialogElement);
    await userEvent.click(dialog.getByRole("button", { name: "취소" }));
    await waitFor(() =>
      expect(within(document.body).queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await expect(canvas.getByText("daily-practice.wav")).toBeVisible();
  },
};
