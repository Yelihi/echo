import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { TagInput } from "@/shared/components/ui/TagInput";

type TagInputStoryArgs = {
  theme: "roleplay" | "memo";
  initialTags: string[];
  placeholder: string;
};

const meta = {
  title: "shared/components/ui/TagInput",
  argTypes: {
    theme: { control: "select", options: ["roleplay", "memo"] },
  },
  args: {
    theme: "roleplay",
    initialTags: ["일상", "초급"],
    placeholder: "태그 입력 후 Enter (예: 일상, 초급)",
  },
  decorators: [
    (Story) => (
      <div className="w-105 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<TagInputStoryArgs>;

export default meta;
type Story = StoryObj<TagInputStoryArgs>;

/**
 * 태그 목록은 호출자가 소유합니다.
 * 중복 방지·쉼표 분리 같은 규칙도 여기(호출자)에 있습니다.
 */
function TagInputDemo({ theme, initialTags, placeholder }: TagInputStoryArgs) {
  const [tags, setTags] = React.useState(initialTags);
  const [draft, setDraft] = React.useState("");

  function commit() {
    const next = draft.trim().replace(/,$/, "");
    if (next && !tags.includes(next)) setTags([...tags, next]);
    setDraft("");
  }

  return (
    <TagInput
      theme={theme}
      tags={tags}
      placeholder={placeholder}
      onRemoveTag={(tag) => setTags(tags.filter((item) => item !== tag))}
      inputProps={{
        value: draft,
        onChange: (event) => setDraft(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          }
        },
      }}
    />
  );
}

export const Roleplay: Story = {
  render: (args) => <TagInputDemo {...args} />,
};

export const Memo: Story = {
  args: {
    theme: "memo",
    initialTags: ["연설", "고급"],
    placeholder: "태그 입력 후 Enter (예: 연설, 고급)",
  },
  render: (args) => <TagInputDemo {...args} />,
};

export const Empty: Story = {
  args: { initialTags: [] },
  render: (args) => <TagInputDemo {...args} />,
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <TagInputDemo {...args} theme="roleplay" />
      <TagInputDemo {...args} theme="memo" initialTags={["연설", "고급"]} />
    </div>
  ),
};
