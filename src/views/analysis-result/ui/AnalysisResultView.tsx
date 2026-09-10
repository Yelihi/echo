import { AnalysisBanner } from "@/shared/components/ui";
import { ResultNavigation } from "./ResultNavigation";
import { analysisResultBannerCopy } from "@/views/analysis-result/config/bannerCopy";
import type { AnalysisResultViewProps } from "@/views/analysis-result/models";

import { ResultAutoRefresh } from "./ResultAutoRefresh";
import { ResultTurn } from "./ResultTurn";
import { AnalysisRetryButton } from "./AnalysisRetryButton";

export function AnalysisResultView({ viewModel, retryAction }: AnalysisResultViewProps) {
  const { kind, result } = viewModel;
  const showRetry = viewModel.canRetry;
  const analyzing = result.state === "pending" || result.state === "analyzing";

  return (
    <div data-pillar={kind === "memorization" ? "memo" : undefined} className="pb-20">
      {(result.state === "pending" || result.state === "analyzing") && <ResultAutoRefresh />}
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold text-gray-text">
            {kind === "roleplay" ? "롤플레잉" : "암기"} · 학습 결과
          </p>
          <h1 className="break-words text-2xl font-bold leading-snug text-black-primary">
            {viewModel.title}
          </h1>
          <p className="mt-1.5 text-body-3 text-gray-text">{viewModel.meta}</p>
        </div>
        {showRetry ? (
          <form action={retryAction}>
            <AnalysisRetryButton />
          </form>
        ) : null}
      </header>

      <AnalysisBanner
        state={result.state}
        title={analyzing ? "녹음을 완료했습니다" : analysisResultBannerCopy[result.state].title}
        description={
          analyzing
            ? "분석이 완료되면 결과를 확인할 수 있습니다. 페이지를 나가도 분석은 계속됩니다."
            : analysisResultBannerCopy[result.state].description
        }
        className="mb-6"
      />

      <p className="mb-6 text-sm leading-relaxed text-gray-text">
        문장 {result.items.length}개 중{" "}
        {result.items.filter((item) => item.state === "ready").length}개 분석 완료 · 음성 인식된
        문장을 기준으로 비교한 결과입니다.
      </p>
      {!analyzing && (
        <section className="flex flex-col gap-8" aria-label="분석 결과 대화">
          {viewModel.turns.map((turn) => (
            <ResultTurn key={turn.id} turn={turn} />
          ))}
        </section>
      )}

      <ResultNavigation />
    </div>
  );
}
