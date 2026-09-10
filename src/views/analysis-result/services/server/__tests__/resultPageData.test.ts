import { describe, expect, it, jest } from "@jest/globals";
import { AnalysisJobState, type AnalysisJob } from "@/entities/analysis-job";
import { PracticeType } from "@/entities/practice-target";
import type { SessionId, UserId, AnalysisJobId } from "@/entities/value-object";
import type {
  SessionAnalysisReader,
  CompletedAnalysisSession,
} from "../../../models/sessionAnalysisReader";
import { SessionAnalysisUnavailable } from "../../../models/sessionAnalysisReader";
import { loadSessionAnalysis } from "../loadSessionAnalysis";

const sessionId = "session" as SessionId;
const ownerId = "owner" as UserId;
const job: AnalysisJob = {
  id: "failed-job" as AnalysisJobId,
  ownerId,
  sessionId,
  practiceType: PracticeType.ROLEPLAY,
  state: AnalysisJobState.FAILED,
  provider: "openai",
  attemptNumber: 1,
  queuedAt: new Date(0),
  startedAt: null,
  completedAt: null,
  failedAt: new Date(0),
  errorCode: null,
  errorMessage: null,
  errorLogRef: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};
function createReader(): SessionAnalysisReader<CompletedAnalysisSession> {
  return {
    findSession: async () => ({ ownerId, state: "completed" }),
    findHistory: async () => [job],
    findRecordings: async () => [],
    findResults: async () => [],
  };
}
describe("분석 결과 읽기", () => {
  it("실패한 job을 반복 조회해도 같은 job의 부분 결과를 읽는다", async () => {
    const reader = createReader();
    const findResults = jest.spyOn(reader, "findResults");
    expect((await loadSessionAnalysis(sessionId, ownerId, reader)).job).toBe(job);
    expect((await loadSessionAnalysis(sessionId, ownerId, reader)).job).toBe(job);
    expect(findResults).toHaveBeenCalledTimes(2);
    expect(findResults).toHaveBeenCalledWith(job.id);
  });
  it("job이 없는 과거 세션은 빈 결과로 표시한다", async () => {
    const reader = createReader();
    reader.findHistory = async () => [];
    const findResults = jest.spyOn(reader, "findResults");
    const result = await loadSessionAnalysis(sessionId, ownerId, reader);
    expect(result.job).toBeNull();
    expect(result.sourceResults).toEqual([]);
    expect(findResults).not.toHaveBeenCalled();
  });
  it.each(["other-owner", "in-progress", "missing"])(
    "접근 불가 조건 %s이면 녹음과 결과를 읽지 않는다",
    async (condition) => {
      const reader = createReader();
      reader.findSession = async () =>
        condition === "missing"
          ? null
          : {
              ownerId: (condition === "other-owner" ? "other" : ownerId) as UserId,
              state: condition === "in-progress" ? "in_progress" : "completed",
            };
      const history = jest.spyOn(reader, "findHistory");
      const recordings = jest.spyOn(reader, "findRecordings");
      await expect(loadSessionAnalysis(sessionId, ownerId, reader)).rejects.toBeInstanceOf(
        SessionAnalysisUnavailable,
      );
      expect(history).not.toHaveBeenCalled();
      expect(recordings).not.toHaveBeenCalled();
    },
  );
});
