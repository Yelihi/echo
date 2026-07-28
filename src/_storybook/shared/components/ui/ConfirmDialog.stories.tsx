import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { Button } from "@/shared/components/atomics/button/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";

const meta = {
  title: "shared/components/ui/ConfirmDialog",
  component: ConfirmDialog,
  argTypes: {
    tone: {
      control: "select",
      options: ["default", "danger"],
    },
    open: {
      control: "boolean",
    },
  },
  args: {
    open: true,
    tone: "default",
    title: "변경사항을 저장할까요?",
    description: "지금까지 편집한 내용을 저장합니다.",
    confirmLabel: "저장",
    cancelLabel: "취소",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Danger: Story = {
  args: {
    tone: "danger",
    title: "이 자료를 삭제할까요?",
    description: "삭제하면 관련 녹음과 분석 결과도 함께 사라지며 되돌릴 수 없습니다.",
    confirmLabel: "삭제",
  },
};

export const WithoutDescription: Story = {
  args: {
    description: undefined,
    title: "세션을 종료할까요?",
    confirmLabel: "종료",
  },
};

/** 열림 상태는 호출자가 소유합니다 — 컴포넌트는 제어 전용입니다. */
function ConfirmDialogDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        자료 삭제
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="이 자료를 삭제할까요?"
        description="삭제하면 관련 녹음과 분석 결과도 함께 사라집니다."
        confirmLabel="삭제"
        cancelLabel="취소"
      />
    </>
  );
}

export const Interactive: Story = {
  render: () => <ConfirmDialogDemo />,
};
