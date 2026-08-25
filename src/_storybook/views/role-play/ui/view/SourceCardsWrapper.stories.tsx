import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// views
import type { SourceCardsWrapperProps } from "@/views/role-play/models/interface";
import {
  SourceCardsWrapper,
  SourceCardsWrapperSkeleton,
} from "@/views/role-play/ui/view/SourceCardsWrapper";

const cards: SourceCardsWrapperProps["cards"] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    tags: [
      { label: "일상", value: "일상" },
      { label: "초급", value: "초급" },
    ],
    title: "Ordering at a Cafe",
    subTitle: "카페에서 주문하기",
    theme: "blue",
    contentValue: 8,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    tags: [
      { label: "여행", value: "여행" },
      { label: "초중급", value: "초중급" },
    ],
    title: "Airport Immigration",
    subTitle: "공항 입국 심사",
    theme: "blue",
    contentValue: 8,
  },
];

const meta = {
  title: "views/role-play/ui/view/SourceCardsWrapper",
  component: SourceCardsWrapper,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SourceCardsWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cards,
  },
};

export const Skeleton: StoryObj = {
  render: () => <SourceCardsWrapperSkeleton />,
};
