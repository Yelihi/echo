import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChevronUp, Trash } from "lucide-react";

import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { ParagraphRow } from "@/shared/components/ui/ParagraphRow";

const SAMPLE = "Hi everyone, my name is Jihoon and I work as a front-end developer.";

function ActionButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-7.5 cursor-pointer items-center justify-center rounded-md text-gray-text transition-colors outline-none hover:bg-gray-background [&_svg]:size-3.75"
    >
      {children}
    </button>
  );
}

const meta = {
  title: "shared/components/ui/ParagraphRow",
  component: ParagraphRow,
  argTypes: {
    mode: { control: "select", options: ["edit", "confirmed"] },
    index: { control: { type: "number", min: 1, max: 20, step: 1 } },
  },
  args: {
    index: 1,
    mode: "edit",
    children: <Textarea rows={2} defaultValue={SAMPLE} />,
  },
  decorators: [
    (Story) => (
      <div className="w-130 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ParagraphRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  args: {
    children: <Textarea rows={2} defaultValue={SAMPLE} />,
    actions: (
      <>
        <ActionButton label="위 문단과 합치기">
          <ChevronUp />
        </ActionButton>
        <ActionButton label="문단 삭제">
          <Trash />
        </ActionButton>
      </>
    ),
  },
};

export const Confirmed: Story = {
  args: {
    mode: "confirmed",
    children: <p className="py-2 text-body-4 leading-relaxed text-black-primary">{SAMPLE}</p>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <ParagraphRow index={1}>
        <Textarea rows={2} defaultValue={SAMPLE} />
      </ParagraphRow>
      <ParagraphRow index={2} mode="confirmed">
        <p className="py-2 text-body-4 leading-relaxed text-black-primary">
          I&apos;ve been learning English for a while because I love watching films.
        </p>
      </ParagraphRow>
    </div>
  ),
};
