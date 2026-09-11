import { z } from "zod";
import type { StudySessionPage } from "./history";

export const historyPageSchema = z.object({
  page: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      createdAt: z.string().datetime({ offset: true }),
      kind: z.enum(["role-playing", "memorization"]),
      itemCount: z.number().int().nonnegative(),
      state: z.enum(["pending", "inProgress", "completed", "partial", "failed"]),
      recordingCompleted: z.boolean(),
    }),
  ),
});

export function mapHistoryPage(input: unknown): StudySessionPage {
  const data = historyPageSchema.parse(input);
  return {
    page: data.page,
    totalPages: data.totalPages,
    totalCount: data.totalCount,
    sessions: data.items.map((item) => ({
      id: item.id,
      title: item.title,
      sessionDate: new Date(item.createdAt),
      sessionType: item.kind,
      sessionState: item.state,
      description: `${item.kind === "role-playing" ? "문장" : "문단"} ${item.itemCount}개${item.recordingCompleted ? "" : " · 녹음 미완료"}`,
      disabled: !item.recordingCompleted,
      href: item.recordingCompleted
        ? `/${item.kind === "role-playing" ? "roleplay" : "memorization"}-sessions/${item.id}/result`
        : undefined,
    })),
  };
}
