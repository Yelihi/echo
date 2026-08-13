import type { AnalysisResultState } from "@/entities/analysis-job";

export const analysisResultBannerCopy: Record<
  AnalysisResultState,
  { title: string; description: string }
> = {
  pending: {
    title: "분석을 준비하고 있어요",
    description: "녹음 분석이 곧 시작됩니다.",
  },
  analyzing: {
    title: "분석 중이에요",
    description: "잠시 후 문장별 결과를 확인할 수 있어요.",
  },
  done: {
    title: "분석이 끝났어요",
    description: "아래에서 문장별 결과를 확인해 보세요.",
  },
  partial: {
    title: "일부 결과만 준비됐어요",
    description: "확인 가능한 결과를 먼저 보여드릴게요.",
  },
  failed: {
    title: "분석에 실패했어요",
    description: "전체 세션을 다시 분석해 주세요.",
  },
};
