import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { RecordUIPresentation } from "@/views/management-records/models/interface";
import { RecordTableRow } from "@/views/management-records/ui/RecordTableRow";

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
  title: "views/management-records/ui/RecordTableRow",
  component: RecordTableRow,
  decorators: [
    (Story) => (
      <div className="w-full max-w-[760px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecordTableRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    record: mockRecords[0],
    first: true,
    last: true,
  },
};

export const DeleteFailed: Story = {
  args: {
    record: mockRecords[1],
    first: true,
    last: true,
  },
};

export const Orphaned: Story = {
  args: {
    record: mockRecords[2],
    first: true,
    last: true,
  },
};

export const AllStatuses: Story = {
  args: {
    record: mockRecords[0],
    first: true,
    last: false,
  },
  render: () => (
    <div>
      {mockRecords.map((record, index) => (
        <RecordTableRow
          key={record.id}
          record={record}
          first={index === 0}
          last={index === mockRecords.length - 1}
        />
      ))}
    </div>
  ),
};
