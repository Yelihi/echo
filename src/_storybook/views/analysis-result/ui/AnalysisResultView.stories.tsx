import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AnalysisResultView } from "@/views/analysis-result/ui/AnalysisResultView";
import { PracticeType } from "@/entities/practice-target";
import type { AnalysisResultPageViewModel } from "@/views/analysis-result/models";
import type { LineId, SessionId } from "@/entities/value-object";
import type { AnalysisResultItemDto } from "@/entities/analysis-job";
import type { PracticeTarget } from "@/entities/practice-target";

const sessionId = "11111111-1111-4111-8111-111111111111" as SessionId;

const readyItem = {
  id: "line-1",
  original: "I would like a window seat.",
  target: createRoleplayTarget("line-1"),
  audio: {
    signedUrl: "https://example.test/audio.wav",
    durationSec: 6,
  },
  state: "ready",
  schemaVersion: "v1",
  transcript: "I want a window seat.",
  diff: [
    { op: "equal", expected: "I", actual: "I" },
    { op: "replace", expected: "would like", actual: "want" },
    { op: "equal", expected: "a window seat.", actual: "a window seat." },
  ],
  feedback: "would like를 쓰면 더 정중하게 들려요.",
} satisfies AnalysisResultItemDto;

const doneViewModel = {
  kind: "roleplay",
  title: "Airport Check-in",
  meta: "오후 3:10 · 문장 3개",
  result: {
    state: "done",
    items: [readyItem],
  },
  turns: [
    {
      id: "line-0",
      speaker: "partner",
      text: "Hello, where would you like to sit?",
    },
    {
      id: "line-1",
      speaker: "me",
      text: "I would like a window seat.",
      analysis: readyItem,
    },
    {
      id: "line-2",
      speaker: "partner",
      text: "Sure. Here is your boarding pass.",
    },
  ],
} satisfies AnalysisResultPageViewModel;

const meta = {
  title: "views/analysis-result/ui/AnalysisResultView",
  component: AnalysisResultView,
  args: {
    viewModel: doneViewModel,
    retryAction: async () => {},
  },
  decorators: [
    (Story) => (
      <main className="mx-auto max-w-[760px] px-5 py-8">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof AnalysisResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Done: Story = {};

export const Partial: Story = {
  args: {
    viewModel: {
      ...doneViewModel,
      result: {
        ...doneViewModel.result,
        state: "partial",
        items: [
          readyItem,
          {
            id: "line-3",
            original: "Could you repeat that?",
            target: createRoleplayTarget("line-3"),
            state: "missing",
          },
        ],
      },
      turns: [
        ...doneViewModel.turns,
        {
          id: "line-3",
          speaker: "me",
          text: "Could you repeat that?",
          analysis: {
            id: "line-3",
            original: "Could you repeat that?",
            target: createRoleplayTarget("line-3"),
            state: "missing",
          },
        },
      ],
    },
  },
};

export const Failed: Story = {
  args: {
    viewModel: {
      ...doneViewModel,
      result: {
        state: "failed",
        items: [
          {
            id: "line-1",
            original: "I would like a window seat.",
            target: createRoleplayTarget("line-1"),
            state: "missing",
          },
        ],
      },
      turns: [
        {
          id: "line-1",
          speaker: "me",
          text: "I would like a window seat.",
          analysis: {
            id: "line-1",
            original: "I would like a window seat.",
            target: createRoleplayTarget("line-1"),
            state: "missing",
          },
        },
      ],
    },
  },
};

function createRoleplayTarget(lineId: string): PracticeTarget {
  return {
    practiceType: PracticeType.ROLEPLAY,
    sessionId,
    lineSnapshotId: lineId as LineId,
  };
}
