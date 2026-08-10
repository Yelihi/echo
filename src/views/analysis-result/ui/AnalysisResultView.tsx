import { RefreshCcw } from "lucide-react";

import type { AnalysisResultItemDto, AnalysisResultState } from "@/entities/analysis-job";
import type { EvaluationDiffSegment } from "@/shared/lib/evaluation";
import { AnalysisBanner, ChatBubble, Feedback } from "@/shared/components/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/tailwind/utils";

import { ResultAudioPlayPill } from "./ResultAudioPlayPill";
import { ResultAutoRefresh } from "./ResultAutoRefresh";
import type { AnalysisResultPageViewModel, ResultTurnViewModel } from "../services/server";

interface AnalysisResultViewProps {
  readonly viewModel: AnalysisResultPageViewModel;
  readonly retryAction: () => Promise<void>;
}

const bannerCopy: Record<AnalysisResultState, { title: string; description: string }> = {
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

export function AnalysisResultView({ viewModel, retryAction }: AnalysisResultViewProps) {
  const { kind, result } = viewModel;
  const showRetry = result.state === "partial" || result.state === "failed";

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
        title={bannerCopy[result.state].title}
        description={bannerCopy[result.state].description}
        className="mb-6"
      />

      <section className="flex flex-col gap-8" aria-label="분석 결과 대화">
        {viewModel.turns.map((turn) => (
          <ResultTurn key={turn.id} turn={turn} />
        ))}
      </section>
    </div>
  );
}

function ResultTurn({ turn }: { readonly turn: ResultTurnViewModel }) {
  const mine = turn.speaker === "me";

  return (
    <article className={cn("flex flex-col gap-2", mine ? "items-end" : "items-start")}>
      <ChatBubble speaker={turn.speaker} className="max-w-[620px]">
        {turn.text}
      </ChatBubble>
      {turn.analysis ? <AnalysisItem item={turn.analysis} /> : null}
    </article>
  );
}

function AnalysisItem({ item }: { readonly item: AnalysisResultItemDto }) {
  if (item.state === "pending") {
    return <p className="text-body-2 text-gray-text">분석 대기 중</p>;
  }

  if (item.state === "missing") {
    return <p className="text-body-2 text-red-primary">결과 없음</p>;
  }

  return (
    <div className="flex max-w-[620px] flex-col items-end gap-2">
      {item.audio ? (
        <ResultAudioPlayPill
          signedUrl={item.audio.signedUrl}
          durationSec={item.audio.durationSec}
        />
      ) : null}
      {item.transcript ? (
        <p className="text-body-2 text-gray-text">Transcript: {item.transcript}</p>
      ) : null}
      {item.diff?.length ? <DiffSegments segments={item.diff} /> : null}
      {item.feedback ? <Feedback>{item.feedback}</Feedback> : null}
    </div>
  );
}

function DiffSegments({ segments }: { readonly segments: ReadonlyArray<EvaluationDiffSegment> }) {
  return (
    <p className="w-full rounded-control bg-card-surface px-3.75 py-3.25 text-body-3 text-black-secondary">
      {segments.map((segment, index) => (
        <span key={`${segment.op}-${index}`} className={diffClassName(segment.op)}>
          {segment.actual ?? segment.expected}
          {index < segments.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

function diffClassName(op: EvaluationDiffSegment["op"]): string {
  if (op === "equal") {
    return "";
  }

  if (op === "insert") {
    return "text-green-primary";
  }

  if (op === "delete") {
    return "text-red-primary line-through";
  }

  return "text-yellow-primary";
}
