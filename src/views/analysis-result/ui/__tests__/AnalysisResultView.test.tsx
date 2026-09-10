import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { AnalysisResultItemDto } from "@/entities/analysis-job";
import { PracticeType } from "@/entities/practice-target";
import type { LineId, SessionId } from "@/entities/value-object";
import { AnalysisResultView } from "../AnalysisResultView";
import { AnalysisItem } from "../AnalysisItem";

describe("실패한 분석 결과", () => {
  it.each(["partial", "failed"] as const)("%s 상태에서도 문장과 원본 녹음을 표시한다", (state) => {
    const item: AnalysisResultItemDto = {
      id: "line",
      original: "Hello there.",
      state: "missing",
      target: {
        practiceType: PracticeType.ROLEPLAY,
        sessionId: "session" as SessionId,
        lineSnapshotId: "line" as LineId,
      },
      audio: { signedUrl: "/recording.webm" },
    };
    render(
      <AnalysisResultView
        retryAction={jest.fn(async () => {})}
        viewModel={{
          kind: "roleplay",
          title: "Practice",
          meta: "Today",
          result: { state, items: [item] },
          turns: [{ id: "line", speaker: "me", text: item.original, analysis: item }],
        }}
      />,
    );
    expect(screen.getByText("Hello there.")).toBeTruthy();
    expect(screen.getByText("원본 문장")).toBeTruthy();
    expect(screen.getByText("실제 발화")).toBeTruthy();
    expect(
      screen
        .getByText("녹음의 발화를 문장으로 표시하지 못했습니다.")
        .closest('[data-slot="chat-bubble"]'),
    ).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "결과 페이지 이동" })).toBeTruthy();
    expect(screen.getByLabelText("저장된 내 녹음 듣기").getAttribute("src")).toBe(
      "/recording.webm",
    );
    expect(screen.getByRole("button", { name: "다시 분석하기" })).toBeTruthy();
  });

  it.each(["I said hello.", ""])(
    "STT 결과 %s를 발화 말풍선 또는 실패 안내로 표시한다",
    (transcript) => {
      render(
        <AnalysisItem
          item={{
            id: "line",
            original: "Hello there.",
            state: "ready",
            transcript,
            target: {
              practiceType: PracticeType.ROLEPLAY,
              sessionId: "session" as SessionId,
              lineSnapshotId: "line" as LineId,
            },
          }}
        />,
      );
      const bubble = screen
        .getByText(transcript || "녹음의 발화를 문장으로 표시하지 못했습니다.")
        .closest('[data-slot="chat-bubble"]');
      expect(bubble).toBeTruthy();
      expect(bubble?.getAttribute("lang")).toBe(transcript ? "en" : "ko");
      expect(bubble?.classList.contains("bg-red-50")).toBe(!transcript);
    },
  );
});
