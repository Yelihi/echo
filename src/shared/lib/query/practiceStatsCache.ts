import "server-only";

import { revalidateTag } from "next/cache";

export const practiceStatsTag = (ownerId: string) => `my-page-practice-stats:${ownerId}`;

export function invalidatePracticeStats(ownerId: string) {
  try {
    revalidateTag(practiceStatsTag(ownerId), { expire: 0 });
  } catch (error) {
    console.error("연습 통계 캐시 무효화 실패", error);
  }
}
