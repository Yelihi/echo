import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ArrowUpRight, AudioLines, Clock, MessageCircle, Mic } from "lucide-react";

import { Button } from "@/shared/components/atomics/button/Button";
import { Card } from "@/shared/components/atomics/card/Card";
import { Badge } from "@/shared/components/atomics/badge/Badge";
import { Input } from "@/shared/components/atomics/input/Input";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { Radio, RadioGroup } from "@/shared/components/atomics/radio/Radio";
import { TagChip } from "@/shared/components/atomics/tag-chip/TagChip";
import { RoleCard } from "@/shared/components/ui/RoleCard";
import { VoicePill } from "@/shared/components/ui/VoicePill";
import { SegmentedControl, SegmentedControlItem } from "@/shared/components/ui/SegmentedControl";
import { SliderField } from "@/shared/components/ui/SliderField";
import { TagInputField } from "@/shared/components/ui/TagInputField";
import { PlayPill } from "@/shared/components/ui/PlayPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { SessionReadyHero } from "@/shared/components/ui/SessionReadyHero";
import { AnalysisBanner } from "@/shared/components/ui/AnalysisBanner";
import { Feedback } from "@/shared/components/ui/Feedback";
import { ChatEditorRow } from "@/shared/components/ui/ChatEditorRow";
import { ChatBubbleInput } from "@/shared/components/ui/ChatBubbleInput";
import { EmptyState } from "@/shared/components/ui/EmptyState";

const meta = {
  title: "shared/Silver & Ink",
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [
    (Story) => (
      <main className="mx-auto max-w-page bg-card-surface p-page-gutter">
        <header className="mb-10 border-b border-card-line pb-6">
          <p className="mb-3 text-body-2 text-gray-text">Echo / Shared components</p>
          <h1 className="break-keep text-heading-lg font-bold">작은 요소부터, 같은 언어로.</h1>
        </header>
        <Story />
      </main>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlsDemo() {
  const [mode, setMode] = useState("roleplay");
  const [role, setRole] = useState("guest");
  const [voice, setVoice] = useState("calm");
  const [tags, setTags] = useState(["일상"]);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="flex min-w-0 flex-col gap-6" aria-label="버튼과 입력">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setOpen(true)}>
            연습 시작 <ArrowUpRight />
          </Button>
          <Button variant="outline">미리보기</Button>
          <Button disabled>준비 중</Button>
          <Button variant="destructive">삭제</Button>
        </div>
        <label className="flex flex-col gap-2 text-body-3">
          연습 제목
          <Input placeholder="예: 카페에서 주문하기" />
        </label>
        <label className="flex flex-col gap-2 text-body-3">
          연습 내용
          <Textarea rows={3} placeholder="연습할 문장을 입력하세요" />
        </label>
        <label className="flex flex-col gap-2 text-body-3 text-danger-ink">
          이메일
          <Input state="error" defaultValue="invalid" aria-describedby="email-error" />
        </label>
        <p id="email-error" className="-mt-4 text-body-2 text-danger-ink">
          이메일 형식을 확인해주세요.
        </p>
        <TagInputField tags={tags} onChange={setTags} placeholder="태그 입력" />
        <RadioGroup defaultValue="normal" aria-label="학습 강도" className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-body-3">
            <Radio value="normal" />
            기본
          </label>
          <label className="flex items-center gap-2 text-body-3">
            <Radio value="intensive" />
            집중
          </label>
        </RadioGroup>
      </section>
      <section className="flex min-w-0 flex-col gap-6" aria-label="선택과 재생">
        <SegmentedControl
          value={mode}
          onValueChange={(value) => value && setMode(value)}
          aria-label="연습 유형"
        >
          <SegmentedControlItem value="roleplay">롤플레이</SegmentedControlItem>
          <SegmentedControlItem value="memo">암기</SegmentedControlItem>
        </SegmentedControl>
        <div className="grid gap-3 sm:grid-cols-2">
          <RoleCard
            title="손님"
            description="필요한 것을 자연스럽게 요청해요."
            selected={role === "guest"}
            onClick={() => setRole("guest")}
          />
          <RoleCard
            title="직원"
            description="질문에 친절하게 답해요."
            selected={role === "staff"}
            onClick={() => setRole("staff")}
          />
        </div>
        <div className="flex gap-3">
          <VoicePill
            icon={<Mic />}
            label="차분한 음성"
            sub="Calm"
            selected={voice === "calm"}
            onClick={() => setVoice("calm")}
          />
          <VoicePill
            icon={<AudioLines />}
            label="밝은 음성"
            sub="Bright"
            selected={voice === "bright"}
            onClick={() => setVoice("bright")}
          />
        </div>
        <SliderField
          label="말하기 속도"
          valueLabel={`${speed.toFixed(1)}x`}
          min={0.5}
          max={1.5}
          step={0.1}
          value={speed}
          onChange={setSpeed}
          minLabel="천천히"
          maxLabel="빠르게"
        />
        <PlayPill
          duration="0:24"
          progress={35}
          playing={playing}
          onToggle={() => setPlaying(!playing)}
        />
      </section>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="연습을 시작할까요?"
        description="선택한 설정으로 연습을 시작합니다."
        confirmLabel="시작"
        cancelLabel="취소"
      />
    </div>
  );
}

export const Controls: Story = {
  render: () => <ControlsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "연습 제목" }), "카페에서 주문하기");
    await expect(canvas.getByRole("textbox", { name: "연습 제목" })).toHaveValue(
      "카페에서 주문하기",
    );
    await userEvent.type(canvas.getByRole("textbox", { name: "태그 입력" }), "여행{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "여행 태그 삭제" }));
    await expect(canvas.queryByRole("button", { name: "여행 태그 삭제" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /^직원/ }));
    await expect(canvas.getByRole("button", { name: /^직원/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(canvas.getByRole("radio", { name: "집중" }));
    await expect(canvas.getByRole("radio", { name: "집중" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "재생" }));
    await expect(canvas.getByRole("button", { name: "일시정지" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "연습 시작" }));
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole("alertdialog")).toBeVisible());
    await userEvent.click(body.getByRole("button", { name: "취소" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
  },
};

export const Surfaces: Story = {
  render: () => (
    <div className="grid gap-8 lg:grid-cols-2">
      <SessionReadyHero
        tags={["일상", "초급"]}
        title="오늘은 카페에서"
        description="자주 쓰는 표현으로 대화를 시작해보세요."
        stats={[
          { icon: <Clock />, label: "예상 시간", value: "3분" },
          { icon: <MessageCircle />, label: "대사", value: "8개" },
          { icon: <Mic />, label: "연습", value: "2회" },
        ]}
      />
      <Card variant="flat" className="flex flex-col justify-between gap-6 p-8">
        <div className="flex flex-wrap gap-2">
          <Badge value="분석 완료" theme="green" />
          <Badge value="확인 필요" theme="yellow" />
        </div>
        <h2 className="text-heading-md font-bold">
          한 문장씩,
          <br />더 자연스럽게.
        </h2>
        <p className="text-body-4 text-gray-text">
          과한 그림자 없이 면과 여백으로 내용을 구분합니다.
        </p>
      </Card>
      <div className="flex flex-col gap-4">
        <AnalysisBanner
          state="analyzing"
          title="발음을 분석하고 있어요"
          description="잠시만 기다려주세요."
        />
        <Feedback>강세를 조금 더 또렷하게 표현해보세요.</Feedback>
      </div>
      <Card variant="flat">
        <EmptyState
          title="아직 연습 기록이 없어요"
          description="첫 연습으로 나만의 기록을 만들어보세요."
        />
      </Card>
    </div>
  ),
};

export const Editor: Story = {
  render: () => (
    <section className="mx-auto flex max-w-2xl flex-col gap-6" aria-label="대사 편집">
      <div className="flex flex-wrap gap-2">
        <TagChip selected>카페</TagChip>
        <TagChip>일상</TagChip>
        <TagChip disabled>준비 중</TagChip>
      </div>
      <ChatEditorRow speaker="partner" speakerLabel="상대방">
        <ChatBubbleInput
          aria-label="상대방 대사"
          defaultValue="Good morning! What can I get for you today?"
        />
      </ChatEditorRow>
      <ChatEditorRow speaker="me" speakerLabel="나">
        <ChatBubbleInput
          speaker="me"
          aria-label="내 대사"
          defaultValue="I'd like an iced latte, please."
        />
      </ChatEditorRow>
    </section>
  ),
};
