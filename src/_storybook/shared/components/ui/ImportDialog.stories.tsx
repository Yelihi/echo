import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Info, RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/atomics/button/Button";
import { Input } from "@/shared/components/atomics/input/Input";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { ImportDialog } from "@/shared/components/ui/ImportDialog";
import { LoadingState } from "@/shared/components/ui/LoadingState";
import { SegmentedControl, SegmentedControlItem } from "@/shared/components/ui/SegmentedControl";

const meta = {
  title: "shared/components/ui/ImportDialog",
  component: ImportDialog,
  argTypes: {
    open: { control: "boolean" },
  },
  args: {
    open: true,
    title: "txt 파일 분석",
    filename: "restaurant_dialog.txt",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 분석 중 — 본문은 LoadingState 를 그대로 씁니다. */
export const Analyzing: Story = {
  args: {
    children: (
      <LoadingState
        title="AI가 대화를 살펴보고 있어요"
        description="상대방과 내 대사를 자동으로 구분하는 중…"
      />
    ),
  },
};

/** 화자 3명 이상 — 본문은 ErrorState 를 그대로 씁니다. */
export const SpeakerError: Story = {
  args: {
    children: (
      <ErrorState
        title="화자가 3명 이상 감지됐어요"
        description="롤플레잉은 2인 대화만 연습할 수 있어요. 화자가 두 명이 되도록 본문을 다듬은 뒤 다시 올려주세요."
      />
    ),
    footer: (
      <>
        <div className="flex-1" />
        <Button variant="ghost">닫기</Button>
        <Button>
          <RefreshCw />
          다른 파일로 다시 시도
        </Button>
      </>
    ),
  },
};

const PREVIEW_ROWS = [
  { speaker: "partner", text: "Good morning! Do you have a reservation?" },
  { speaker: "me", text: "Yes, it's under the name Lee." },
  { speaker: "partner", text: "Great, a table for two by the window?" },
];

/** AI 초안 미리보기 — 화자는 SegmentedControl 로 바꿉니다. */
export const Preview: Story = {
  args: {
    children: (
      <>
        <div className="flex items-center gap-2.5 bg-blue-secondary px-6 py-3.5 text-body-2 text-blue-focus-title">
          <Info className="size-4 shrink-0" />
          AI가 나눈 초안이에요. 화자가 틀렸다면 라벨을 눌러 바꾸고, 내용도 바로 고칠 수 있어요.
        </div>
        <div className="flex flex-col gap-2.5 px-6 py-4.5">
          {PREVIEW_ROWS.map((row, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <SegmentedControl value={row.speaker} onValueChange={() => {}}>
                <SegmentedControlItem value="partner">상대방</SegmentedControlItem>
                <SegmentedControlItem value="me">나</SegmentedControlItem>
              </SegmentedControl>
              <Input
                defaultValue={row.text}
                className={row.speaker === "me" ? "h-10.5 bg-blue-secondary" : "h-10.5"}
              />
            </div>
          ))}
        </div>
      </>
    ),
    footer: (
      <>
        <Button variant="outline">
          <RefreshCw />
          다시 분석
        </Button>
        <div className="flex-1" />
        <Button variant="ghost">취소</Button>
        <Button>이대로 불러오기</Button>
      </>
    ),
  },
};
