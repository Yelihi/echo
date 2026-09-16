import type { RecordingCompletionPanelProps } from "../../models/ui";
import Link from "next/link";
import { ArrowRight, Check, Home, List, LoaderCircle, RotateCcw } from "lucide-react";
import { GlassButton } from "./RecordingControls";

export function RecordingCompletionPanel({
  status = "idle",
  title,
  savedCount,
  resultHref,
  onRetry,
}: RecordingCompletionPanelProps) {
  const busy = status === "submitting";
  const failed = status === "failed";
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-16 text-center text-white sm:py-24">
      <Check className="mb-6 size-14 text-emerald-300" aria-hidden="true" />
      <p className="mb-3 text-sm font-semibold text-accent-glow">
        {resultHref ? "연습 완료" : "완료 확인"}
      </p>
      <h1 className="text-3xl font-bold leading-snug">
        {resultHref ? "녹음을 마쳤습니다" : "저장한 연습을 마무리하세요"}
      </h1>
      {title && <p className="mt-4 text-lg font-semibold">{title}</p>}
      {savedCount !== undefined && (
        <p className="mt-2 text-sm text-white/75">
          {savedCount}/{savedCount}문장 저장 완료
        </p>
      )}
      <p className="mb-8 mt-4 max-w-sm break-keep text-base leading-7 text-white/70">
        {resultHref
          ? "녹음이 모두 저장되었습니다. 분석은 백그라운드에서 진행되며, 완료된 결과는 학습 기록에서 확인할 수 있습니다."
          : "모든 문장 녹음이 저장되었습니다. 연습을 완료하면 저장된 녹음으로 분석을 시작합니다. 다시 녹음할 필요는 없습니다."}
      </p>
      {failed && <p role="alert">완료 처리를 확인하지 못했습니다. 다시 시도해주세요.</p>}
      {resultHref ? (
        <Link
          href={resultHref}
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-pill bg-silver text-black-primary px-6 py-3 font-semibold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          분석 결과 확인 <ArrowRight className="size-5" />
        </Link>
      ) : (
        onRetry && (
          <GlassButton onClick={onRetry} disabled={busy} emphasis="primary">
            {busy ? <LoaderCircle className="animate-spin" /> : <RotateCcw />}
            {busy ? "완료 처리 중" : failed ? "완료 다시 시도" : "연습 완료하고 분석하기"}
          </GlassButton>
        )
      )}
      <div className="mt-10 flex w-full flex-wrap justify-center gap-8 border-t border-white/15 pt-6 text-sm text-white/75">
        <Link href="/sessions" className="inline-flex items-center gap-2">
          <List className="size-4" />
          세션 목록
        </Link>
        <Link href="/home" className="inline-flex items-center gap-2">
          <Home className="size-4" />홈
        </Link>
      </div>
    </section>
  );
}
