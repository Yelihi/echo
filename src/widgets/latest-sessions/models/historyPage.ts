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
      sourceMaterialId: z.string().uuid().nullable(),
      targetCount: z.number().int().nonnegative(),
      savedCount: z.number().int().nonnegative(),
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
      sessionState: item.recordingCompleted ? item.state : "practicing",
      description: item.recordingCompleted
        ? `${item.kind === "role-playing" ? "문장" : "문단"} ${item.itemCount}개`
        : `${item.savedCount}/${item.targetCount}문장 저장`,
      actionLabel:
        !item.recordingCompleted && item.savedCount === item.targetCount && item.targetCount > 0
          ? "완료 확인"
          : undefined,
      disabled: !item.recordingCompleted && item.kind !== "role-playing",
      href: item.recordingCompleted
        ? `/${item.kind === "role-playing" ? "roleplay" : "memorization"}-sessions/${item.id}/result`
        : item.kind === "role-playing"
          ? `/role-playing/${item.sourceMaterialId ?? item.id}/session/${item.id}`
          : undefined,
    })),
  };
}
