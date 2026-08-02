import type {
  RecordUIPresentation,
  RecordsSummary,
} from "@/views/management-records/models/interface";

export const mockRecords: RecordUIPresentation[] = [
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
  {
    id: "record-connected-002",
    status: "connected",
    name: "memo-business-email.m4a",
    fileSize: "6.8MB",
    createdAt: "2026.07.18",
    inSession: "2",
  },
];

export const mockRecordsSummary = mockRecords.reduce<RecordsSummary>(
  (summary, record) => ({
    total: summary.total + 1,
    connected: summary.connected + (record.status === "connected" ? 1 : 0),
    failDelete: summary.failDelete + (record.status === "delete-failed" ? 1 : 0),
    orphaned: summary.orphaned + (record.status === "orphaned" ? 1 : 0),
  }),
  {
    total: 0,
    connected: 0,
    failDelete: 0,
    orphaned: 0,
  },
);
