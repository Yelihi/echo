import type { RecordingCompletionPanelProps } from "../../models/ui";
import Link from "next/link";
import { ArrowRight, Check, Home, List, LoaderCircle, RotateCcw } from "lucide-react";
import { GlassButton } from "./RecordingControls";

export function RecordingCompletionPanel({
  status = "idle",
  resultHref,
  onRetry,
}: RecordingCompletionPanelProps) {
  const busy = status === "submitting";
  const failed = status === "failed";
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-16 text-center text-white sm:py-24">
      <Check className="mb-6 size-14 text-emerald-300" aria-hidden="true" />
      <p className="mb-3 text-sm font-semibold text-accent-glow">연습 완료</p>
      <h1 className="text-3xl font-bold leading-snug">녹음을 마쳤습니다</h1>
      <p className="mb-8 mt-4 max-w-sm break-keep text-base leading-7 text-white/70">
        {resultHref
          ? "녹음이 모두 저장되었습니다. 분석은 백그라운드에서 진행되며, 완료된 결과는 학습 기록에서 확인할 수 있습니다."
          : "마지막 녹음까지 마쳤습니다. 완료 처리가 확인되면 분석 결과를 확인할 수 있습니다."}
      </p>
      {failed && <p role="alert">완료 처리를 확인하지 못했습니다. 다시 시도해주세요.</p>}
      {resultHref ? (
        <Link
          href={resultHref}
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-accent-600 px-6 py-3 font-semibold hover:bg-accent-700 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          분석 결과 확인 <ArrowRight className="size-5" />
        </Link>
      ) : (
        onRetry && (
          <GlassButton onClick={onRetry} disabled={busy} emphasis="primary">
            {busy ? <LoaderCircle className="animate-spin" /> : <RotateCcw />}
            {busy ? "완료 처리 중" : failed ? "완료 다시 시도" : "완료 확인"}
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
