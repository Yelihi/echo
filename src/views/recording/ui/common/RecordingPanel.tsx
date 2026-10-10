"use client";
import type { RecordingPanelProps } from "@/views/recording/models/ui";

import { LoaderCircle, RotateCcw, Volume2 } from "lucide-react";
import { RecordedAudioPlayer } from "./RecordedAudioPlayer";

import {
  GlassButton,
  PartnerCard,
  RecordOrb,
  TimerPill,
} from "@/views/recording/ui/common/RecordingControls";

export function RecordingPanel({
  content,
  phase,
  durationLabel,
  message,
  saving = false,
  busy = false,
  timedOut = false,
  notice,
  recordedAudio,
  actions,
}: RecordingPanelProps) {
  const recording = phase === "recording";
  const recorded = phase === "recorded";

  return (
    <>
      <section className="relative z-10 mx-auto flex w-full max-w-[640px] flex-col items-center gap-6 px-5 pb-6 pt-20 text-center sm:gap-8">
        {content.kind === "partner" ? (
          <PartnerCard role={content.role}>{content.line}</PartnerCard>
        ) : content.kind === "prompt" ? (
          <div aria-live="polite" className="max-h-[40vh] overflow-y-auto text-left">
            <h1 className="mb-3 text-sm text-white/70">{content.label}</h1>
            <p
              lang={content.lang}
              className="whitespace-pre-wrap text-xl leading-relaxed text-white"
            >
              {content.text}
            </p>
          </div>
        ) : (
          <h1 className="text-heading-md font-bold text-white">{content.title}</h1>
        )}
        <RecordOrb
          phase={phase}
          disabled={
            phase === "partner-speaking" ||
            recorded ||
            phase === "completed" ||
            saving ||
            busy ||
            (content.kind === "prompt" && content.unavailable === true)
          }
          onClick={actions.toggle}
        />
        <div className="flex flex-col items-center gap-[13px]">
          <TimerPill recording={recording}>{durationLabel}</TimerPill>
          <p
            role={timedOut ? "alert" : undefined}
            className="break-keep text-sm leading-6 text-white/70"
          >
            {busy
              ? recording
                ? "녹음을 마무리하고 있습니다."
                : "마이크 권한을 확인하고 있습니다."
              : message}
          </p>
          {(phase === "user-ready" || phase === "partner-speaking") &&
          content.kind === "partner" &&
          content.canReplay ? (
            <GlassButton onClick={content.onReplay} disabled={saving}>
              <Volume2 />
              다시 듣기
            </GlassButton>
          ) : null}
        </div>
        {recorded && recordedAudio && !saving ? (
          <RecordedAudioPlayer blob={recordedAudio.blob} />
        ) : null}
      </section>
      {timedOut ? (
        <div className="relative z-10 flex justify-center px-5 pb-6">
          <GlassButton onClick={actions.toggle} disabled={busy}>
            <RotateCcw />
            다시 녹음
          </GlassButton>
        </div>
      ) : null}
      {notice ? (
        <div className="relative z-10 mx-auto max-w-[640px] px-5 pb-6 text-center text-sm leading-6 text-white/70">
          {notice.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
      {recorded ? (
        <footer className="relative z-10 flex flex-wrap justify-center gap-2.5 px-5 pb-8">
          <GlassButton onClick={actions.retry} disabled={saving}>
            <RotateCcw />
            다시 녹음
          </GlassButton>
          <GlassButton emphasis="primary" onClick={actions.save} disabled={saving}>
            {saving ? <LoaderCircle className="animate-spin" /> : null}
            {saving ? "저장 중" : "저장하기"}
          </GlassButton>
        </footer>
      ) : null}
    </>
  );
}
