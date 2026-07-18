import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Bold, Italic, Underline } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";

type ToggleGroupStoryState = "default" | "selected" | "focused" | "disabled";

type ToggleGroupStoryArgs = {
  theme: "blue" | "black";
  size: "default" | "sm" | "lg";
  spacing: number;
  orientation: "horizontal" | "vertical";
  state: ToggleGroupStoryState;
};

const meta = {
  title: "shared/components/ui/ToggleGroup",
  argTypes: {
    theme: {
      control: "select",
      options: ["blue", "black"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    spacing: {
      control: { type: "number", min: 0, max: 6, step: 1 },
    },
    state: {
      control: "select",
      options: ["default", "selected", "focused", "disabled"],
    },
  },
  args: {
    theme: "blue",
    size: "default",
    spacing: 2,
    orientation: "horizontal",
    state: "default",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<ToggleGroupStoryArgs>;

export default meta;

type Story = StoryObj<ToggleGroupStoryArgs>;

function ToggleGroupDemo({ theme, size, spacing, orientation, state }: ToggleGroupStoryArgs) {
  const focusedItemRef = React.useRef<HTMLButtonElement>(null);
  const isDisabled = state === "disabled";
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSelectedValues(state === "selected" || state === "focused" ? ["italic"] : []);

    if (state === "focused") {
      focusedItemRef.current?.focus();
      return;
    }

    focusedItemRef.current?.blur();
  }, [state]);

  return (
    <ToggleGroup
      type="multiple"
      theme={theme}
      size={size}
      spacing={spacing}
      orientation={orientation}
      value={selectedValues}
      onValueChange={setSelectedValues}
      disabled={isDisabled}
    >
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem
        ref={focusedItemRef}
        value="italic"
        aria-label="Toggle italic"
        className={state === "focused" ? "z-10 ring-[3px] ring-ring/50" : undefined}
      >
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function SingleSelectionDemo({ theme, size, spacing, orientation, state }: ToggleGroupStoryArgs) {
  const isDisabled = state === "disabled";
  const [selectedValue, setSelectedValue] = React.useState("");

  React.useEffect(() => {
    setSelectedValue(state === "selected" || state === "focused" ? "center" : "");
  }, [state]);

  return (
    <ToggleGroup
      type="single"
      theme={theme}
      size={size}
      spacing={spacing}
      orientation={orientation}
      value={selectedValue}
      onValueChange={setSelectedValue}
      disabled={isDisabled}
    >
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  );
}

export const Default: Story = {
  render: (args) => <ToggleGroupDemo {...args} />,
};

export const SingleSelection: Story = {
  args: {
    theme: "black",
    state: "selected",
  },
  render: (args) => <SingleSelectionDemo {...args} />,
};

export const Outline: Story = {
  args: {
    theme: "black",
  },
  render: (args) => <ToggleGroupDemo {...args} />,
};

export const Vertical: Story = {
  args: {
    theme: "black",
    orientation: "vertical",
  },
  render: (args) => <ToggleGroupDemo {...args} />,
};

export const NoSpacing: Story = {
  args: {
    theme: "black",
    spacing: 0,
  },
  render: (args) => <ToggleGroupDemo {...args} />,
};
