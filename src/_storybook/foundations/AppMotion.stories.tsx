import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { PageEnter } from "@/shared/components/motion/PageEnter";
import { AnimatedMenu } from "@/shared/components/motion/AnimatedMenu";
import { Button, Input, ProgressTrack } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components/ui";

function MotionDemo() {
  const [route, setRoute] = useState(0);
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-heading-lg font-bold">앱 모션</h1>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setRoute(route + 1)}>페이지 전환</Button>
        <Button variant="outline" onClick={() => setDialog(true)}>
          팝업 열기
        </Button>
        <div className="relative">
          <Button aria-expanded={open} aria-controls="motion-menu" onClick={() => setOpen(!open)}>
            메뉴
          </Button>
          <AnimatedMenu
            open={open}
            id="motion-menu"
            className="absolute right-0 z-10 mt-2 w-44 rounded-panel border bg-white p-3 shadow-strong"
          >
            <Button variant="ghost" onClick={() => setOpen(false)}>
              메뉴 닫기
            </Button>
          </AnimatedMenu>
        </div>
      </div>
      <PageEnter transitionKey={String(route)}>
        <section className="space-y-5 rounded-card border border-card-line bg-white p-6">
          <h2 className="text-heading-xs font-bold">상태를 유지하는 본문</h2>
          <Input aria-label="유지할 입력" placeholder="입력 후 페이지 전환을 눌러보세요" />
          <ProgressTrack value={(route % 5) * 25} />
          <a
            href="#motion-card"
            id="motion-card"
            data-motion-card="true"
            className="block rounded-panel border border-card-line p-5"
          >
            살짝 떠오르는 카드
          </a>
        </section>
      </PageEnter>
      <ConfirmDialog
        open={dialog}
        onOpenChange={setDialog}
        title="부드러운 팝업"
        description="닫기와 포커스 복귀도 기존 동작을 유지합니다."
        confirmLabel="확인"
        cancelLabel="취소"
      />
    </main>
  );
}

const meta = {
  title: "foundations/App Motion",
  component: MotionDemo,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
} satisfies Meta<typeof MotionDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "유지할 입력" });
    await userEvent.type(input, "Keep this draft");
    await userEvent.click(canvas.getByRole("button", { name: "페이지 전환" }));
    await expect(canvas.getByRole("textbox", { name: "유지할 입력" })).toBe(input);
    await expect(input).toHaveValue("Keep this draft");
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
    await userEvent.click(canvas.getByRole("button", { name: "메뉴" }));
    await userEvent.click(await canvas.findByRole("button", { name: "메뉴 닫기" }));
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "메뉴 닫기" })).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "팝업 열기" }));
    const popup = await within(document.body).findByRole("alertdialog");
    await waitFor(() => expect(popup).toBeVisible());
    await userEvent.click(within(popup).getByRole("button", { name: "취소" }));
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};
