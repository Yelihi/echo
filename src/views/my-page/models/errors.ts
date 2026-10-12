import { CustomError } from "@/shared/errors/CustomError";

export class PracticeStatsLoadError extends CustomError {
  constructor(cause: unknown) {
    super("STATS-001", "연습 통계를 불러오지 못했습니다.", { cause });
  }
}
