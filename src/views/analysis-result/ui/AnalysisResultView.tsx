import { Home, RefreshCcw } from "lucide-react";
import Link from "next/link";

import { AnalysisBanner } from "@/shared/components/ui";
import { Button } from "@/components/ui/button";
import { analysisResultBannerCopy } from "@/views/analysis-result/config/bannerCopy";
import type { AnalysisResultViewProps } from "@/views/analysis-result/models";

import { ResultAutoRefresh } from "./ResultAutoRefresh";
import { ResultTurn } from "./ResultTurn";

export function AnalysisResultView({ viewModel, retryAction }: AnalysisResultViewProps) {
  const { kind, result } = viewModel;
  const showRetry = result.state === "failed";

  return (
    <div data-pillar={kind === "memorization" ? "memo" : undefined} className="pb-20">
      {(result.state === "pending" || result.state === "analyzing") && <ResultAutoRefresh />}
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-md font-bold text-black-primary">{viewModel.title}</h1>
          <p className="mt-1.5 text-body-3 text-gray-text">{viewModel.meta}</p>
        </div>
        {showRetry ? (
          <form action={retryAction}>
            <Button className="bg-accent-600 text-white hover:bg-accent-700">
              <RefreshCcw className="size-4" />
              다시 분석하기
            </Button>
          </form>
        ) : null}
      </header>

      <AnalysisBanner
        state={result.state}
        title={analysisResultBannerCopy[result.state].title}
        description={analysisResultBannerCopy[result.state].description}
        className="mb-6"
      />

      <section className="flex flex-col gap-8" aria-label="분석 결과 대화">
        {viewModel.turns.map((turn) => (
          <ResultTurn key={turn.id} turn={turn} />
        ))}
      </section>

      <footer className="mt-10 flex justify-center">
        <Button size="lg" asChild>
          <Link href="/home">
            <Home className="size-4" />
            메인으로 가기
          </Link>
        </Button>
      </footer>
    </div>
  );
}
