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
        ) : (
          <h1 className="text-heading-md font-bold text-white">{content.title}</h1>
        )}
        <RecordOrb
          phase={phase}
          disabled={phase === "partner-speaking" || recorded || phase === "completed" || saving}
          onClick={actions.toggle}
        />
        <div className="flex flex-col items-center gap-[13px]">
          <TimerPill recording={recording}>{durationLabel}</TimerPill>
          <p className="break-keep text-sm leading-6 text-white/70">{message}</p>
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
