import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { RecordUIPresentation } from "@/views/management-records/models/interface";
import { RecordTable } from "@/views/management-records/ui/RecordTable";

const mockRecords = [
  {
    id: "record-connected-001",
    status: "connected",
    name: "roleplay-interview-session.wav",
    fileSize: "12.4MB",
    createdAt: "2026.07.23",
    inSession: "3",
  },
  {
    id: "record-delete-failed-001",
    status: "delete-failed",
    name: "daily-speaking-practice-failed-delete.m4a",
    fileSize: "8.7MB",
    createdAt: "2026.07.22",
    inSession: "1",
  },
  {
    id: "record-orphaned-001",
    status: "orphaned",
    name: "unlinked-pronunciation-drill.mp3",
    fileSize: "4.1MB",
    createdAt: "2026.07.20",
  },
] satisfies RecordUIPresentation[];

const meta = {
  title: "views/management-records/ui/RecordTable",
  component: RecordTable,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-background p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecordTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    records: mockRecords,
  },
};

export const Empty: Story = {
  args: {
    records: [],
  },
};
