/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";
import { Children, isValidElement } from "react";
import { ResultAutoRefresh } from "@/views/analysis-result";
import type { LatestSessionState } from "@/widgets/latest-sessions/models/interface";

jest.mock("@/widgets/latest-sessions/services/server/getStudySessionPage", () => ({
  getStudySessionPage: jest.fn(),
}));

describe("학습 기록 자동 갱신", () => {
  it.each<{ status: string; states: LatestSessionState[]; polling: boolean }>([
    { status: "inProgress", states: [], polling: false },
    { status: "all", states: [], polling: false },
    { status: "all", states: ["completed", "partial", "failed", "pending"], polling: false },
    { status: "inProgress", states: ["inProgress"], polling: true },
    { status: "all", states: ["completed", "inProgress"], polling: true },
  ])(
    "필터 $status, 세션 $states일 때 자동 갱신은 $polling",
    async ({ status, states, polling }) => {
      const { getStudySessionPage } =
        await import("@/widgets/latest-sessions/services/server/getStudySessionPage");
      const { default: SessionsPage } = await import("../page");
      jest.mocked(getStudySessionPage).mockResolvedValueOnce({
        page: 1,
        totalPages: 1,
        totalCount: states.length,
        sessions: states.map((sessionState) => ({
          id: sessionState,
          title: "연습",
          sessionDate: new Date("2026-09-10T00:00:00Z"),
          description: "문장 3개",
          sessionType: "role-playing",
          sessionState,
        })),
      });

      const page = await SessionsPage({ searchParams: Promise.resolve({ status }) });
      const hasAutoRefresh = Children.toArray(page.props.children).some(
        (child) => isValidElement(child) && child.type === ResultAutoRefresh,
      );

      expect(hasAutoRefresh).toBe(polling);
    },
  );
});
