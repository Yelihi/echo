"use client";

import type { SessionTopBarProps } from "@/views/recording/models/ui";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useRecordingExit } from "../../services/hooks/useRecordingExit";
import { ChevronLeft, X } from "lucide-react";

import { getRecordingProgress } from "@/views/recording/models/recordingSessionProgress";

export function SessionTopBar({
  backHref,
  close,
  current,
  total,
  hasUnsavedRecording = false,
  saving = false,
  resumable = false,
}: SessionTopBarProps) {
  const exit = useRecordingExit(hasUnsavedRecording, saving);
  const Icon = close ? X : ChevronLeft;

  return (
    <>
      <header className="relative z-10 flex h-20 items-center gap-4 px-6 py-5">
        <button
          type="button"
          onClick={() => exit.requestExit(backHref, close)}
          disabled={saving}
          aria-label={close ? "연습 나가기" : "이전 화면으로 돌아가기"}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-session-glass-line bg-session-glass text-white backdrop-blur-xl transition-colors hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-accent-glow/40 focus-visible:outline-none"
        >
          <Icon className="size-[18px]" />
        </button>
        <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-session-glass-line">
          <div
            className="h-full rounded-full bg-accent-glow transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${getRecordingProgress(current, total)}%` }}
          />
        </div>
        <p className="min-w-12 shrink-0 whitespace-nowrap text-right text-body-3 font-medium text-white">
          {current} / {total}
        </p>
      </header>
      {(saving || exit.blocked) && (
        <p role="status" className="relative z-10 px-6 text-center text-body-3 text-white/75">
          {saving
            ? "저장 중입니다. 완료 후 나갈 수 있습니다."
            : "저장이 끝났습니다. 다시 나가기를 선택해 주세요."}
        </p>
      )}
      <ConfirmDialog
        open={exit.confirmOpen}
        onOpenChange={exit.setConfirmOpen}
        title="연습을 나갈까요?"
        description={[
          resumable
            ? "저장한 문장은 유지되며 학습 기록에서 이어서 연습할 수 있습니다."
            : "현재 화면의 연습 진행은 복원되지 않습니다.",
          hasUnsavedRecording ? "저장하지 않은 현재 녹음은 사라집니다." : "",
        ]
          .filter(Boolean)
          .join(" ")}
        confirmLabel="나가기"
        cancelLabel="계속 연습"
        onConfirm={exit.confirmExit}
      />
    </>
  );
}
