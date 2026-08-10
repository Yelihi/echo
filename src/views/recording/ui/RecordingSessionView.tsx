"use client";

import Link from "next/link";
import { ChevronLeft, Mic, RotateCcw, Square, X } from "lucide-react";
import * as React from "react";

import type { CapturedAudio } from "@/shared/lib/audio";
import { useRecordingSession } from "@/shared/lib/session-recording";
import { cn } from "@/shared/lib/tailwind/utils";
import { formatRecordingDuration } from "@/views/recording/ui/formatRecordingDuration";

export type RecordingPillar = "roleplay" | "memo";
export type RecordingPhase =
  | "ready"
  | "partner-speaking"
  | "user-ready"
  | "recording"
  | "recorded"
  | "failed";

export interface RecordingSessionViewProps {
  pillar: RecordingPillar;
  backHref: string;
  closeHref: string;
  readyLabel: string;
  title: string;
  description: readonly string[];
  meta: readonly string[];
  totalSteps: number;
  activeStep: number;
  partnerRole?: string;
  partnerLine?: string;
  initialPhase?: RecordingPhase;
  demoDurationMs?: number;
  autoAdvancePartner?: boolean;
  saveRecording?: (audio: CapturedAudio) => Promise<void>;
}

export function RecordingSessionView({
  pillar,
  backHref,
  closeHref,
  readyLabel,
  title,
  description,
  meta,
  totalSteps,
  activeStep,
  partnerRole,
  partnerLine,
  initialPhase = "ready",
  demoDurationMs = 12000,
  autoAdvancePartner = true,
  saveRecording,
}: RecordingSessionViewProps) {
  const recording = useRecordingSession();
  const [phase, setPhase] = React.useState<RecordingPhase>(initialPhase);
  const [elapsedMs, setElapsedMs] = React.useState(demoDurationMs);
  const startedAtRef = React.useRef<number | null>(null);
  const audio =
    recording.state.status === "recorded" ||
    recording.state.status === "saving" ||
    recording.state.status === "failed"
      ? recording.state.audio
      : null;
  const displayedStep = phase === "ready" ? 0 : Math.min(activeStep, totalSteps);
  const isRecording = phase === "recording";
  const isRecorded = phase === "recorded";
  const isOrbDisabled = phase === "partner-speaking";
  const hasPartnerTurn = Boolean(partnerRole && partnerLine);
  const canSave = Boolean(saveRecording && audio);
  const durationLabel = isRecording
    ? formatRecordingDuration(elapsedMs)
    : formatRecordingDuration(audio?.durationMs ?? demoDurationMs);

  React.useEffect(() => {
    setPhase(initialPhase);
  }, [initialPhase]);

  React.useEffect(() => {
    if (phase !== "partner-speaking" || !autoAdvancePartner) {
      return;
    }

    const timeoutId = window.setTimeout(() => setPhase("user-ready"), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [autoAdvancePartner, phase]);

  React.useEffect(() => {
    if (phase !== "recording") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - (startedAtRef.current ?? Date.now()));
    }, 250);
    return () => window.clearInterval(intervalId);
  }, [phase]);

  React.useEffect(() => {
    if (recording.state.status === "failed" || recording.state.status === "discarded") {
      setPhase("failed");
    }
  }, [recording.state.status]);

  const startTurn = () => setPhase(hasPartnerTurn ? "partner-speaking" : "user-ready");

  const handleOrbClick = async () => {
    if (phase === "recording") {
      await recording.stop();
      setPhase("recorded");
      return;
    }

    if (phase === "failed") {
      recording.retry();
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      await recording.start();
      setPhase("recording");
      return;
    }

    if (phase === "recorded") {
      recording.retry();
      startedAtRef.current = null;
      setElapsedMs(0);
      setPhase("user-ready");
      return;
    }

    if (phase === "user-ready") {
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      await recording.start();
      setPhase("recording");
    }
  };

  const handleSave = async () => {
    if (!audio || !saveRecording) return;

    try {
      recording.markSaving();
      await saveRecording(audio);
      recording.markSaved();
      setPhase("user-ready");
    } catch {
      recording.fail("저장하지 못했습니다. 다시 시도해주세요.", audio);
      setPhase("recorded");
    }
  };

  return (
    <main
      data-pillar={pillar === "memo" ? "memo" : undefined}
      className="relative min-h-lvh overflow-hidden bg-session-bg text-white"
    >
      <div className="pointer-events-none absolute left-1/2 top-[-520px] h-[900px] w-[min(1600px,120vw)] -translate-x-1/2 rounded-full bg-accent-glow/18 blur-[120px]" />
      <SessionTopBar
        backHref={phase === "ready" ? backHref : closeHref}
        close={phase !== "ready"}
        current={displayedStep}
        total={totalSteps}
      />

      {phase === "ready" ? (
        <ReadyPanel
          label={readyLabel}
          title={title}
          description={description}
          meta={meta}
          onPreview={startTurn}
          onStart={startTurn}
        />
      ) : (
        <RecordingPanel
          title={title}
          role={partnerRole}
          line={partnerLine}
          phase={phase}
          durationLabel={durationLabel}
          orbDisabled={isOrbDisabled}
          recording={isRecording}
          recorded={isRecorded}
          hasPartnerTurn={hasPartnerTurn}
          saveDisabled={!canSave}
          saving={recording.state.status === "saving"}
          message={getHint(phase, recording.state.status)}
          onOrbClick={handleOrbClick}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

function SessionTopBar({
  backHref,
  close,
  current,
  total,
}: {
  backHref: string;
  close: boolean;
  current: number;
  total: number;
}) {
  const progress = total <= 0 ? 0 : Math.max(0, Math.min(100, (current / total) * 100));
  const Icon = close ? X : ChevronLeft;

  return (
    <header className="relative z-10 flex h-20 items-center gap-4 px-6 py-5">
      <Link
        href={backHref}
        aria-label={close ? "세션 종료" : "이전 화면으로 돌아가기"}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-session-glass-line bg-session-glass text-white backdrop-blur-xl transition-colors hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-accent-glow/40 focus-visible:outline-none"
      >
        <Icon className="size-[18px]" />
      </Link>
      <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-session-glass-line">
        <div
          className="h-full rounded-full bg-accent-glow transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="w-8 shrink-0 text-right text-body-3 font-medium text-white">
        {current} / {total}
      </p>
    </header>
  );
}

function ReadyPanel({
  label,
  title,
  description,
  meta,
  onPreview,
  onStart,
}: {
  label: string;
  title: string;
  description: readonly string[];
  meta: readonly string[];
  onPreview: () => void;
  onStart: () => void;
}) {
  return (
    <section className="absolute inset-0 flex items-center justify-center px-5 pt-20 text-center">
      <div className="flex max-w-[560px] flex-col items-center gap-5">
        <span className="inline-flex h-[27px] items-center rounded-full bg-accent-50 px-3 text-body-1 font-bold text-accent-700">
          {label}
        </span>
        <h1 className="text-heading-lg font-bold text-white">{title}</h1>
        <div className="text-body-5 text-white/62">
          {description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {meta.map((item) => (
            <span
              key={item}
              className="inline-flex h-[27px] items-center rounded-full border border-card-line-strong px-3 text-body-1 font-bold text-white"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5 pt-5">
          <GlassButton onClick={onPreview}>
            <RotateCcw />
            문장 미리 보기
          </GlassButton>
          <GlassButton emphasis="primary" onClick={onStart}>
            <RotateCcw />
            시작하기
          </GlassButton>
        </div>
      </div>
    </section>
  );
}

function RecordingPanel({
  title,
  role,
  line,
  phase,
  durationLabel,
  orbDisabled,
  recording,
  recorded,
  hasPartnerTurn,
  saveDisabled,
  saving,
  message,
  onOrbClick,
  onSave,
}: {
  title: string;
  role?: string;
  line?: string;
  phase: RecordingPhase;
  durationLabel: string;
  orbDisabled: boolean;
  recording: boolean;
  recorded: boolean;
  hasPartnerTurn: boolean;
  saveDisabled: boolean;
  saving: boolean;
  message: string;
  onOrbClick: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <section className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col items-center gap-9 px-5 pt-[70px] text-center">
        {hasPartnerTurn && line ? (
          <PartnerCard role={role ?? ""}>{line}</PartnerCard>
        ) : (
          <h1 className="text-heading-md font-bold text-white">{title}</h1>
        )}
        <RecordOrb
          phase={phase}
          disabled={orbDisabled}
          recording={recording}
          recorded={recorded}
          onClick={onOrbClick}
        />
        <div className="flex flex-col items-center gap-[13px]">
          <TimerPill recording={recording}>{durationLabel}</TimerPill>
          <p className="text-body-3 text-white/55">{message}</p>
        </div>
      </section>
      {recorded ? (
        <footer className="absolute inset-x-0 bottom-5 z-10 flex justify-center px-5 py-3">
          <GlassButton onClick={onSave} disabled={saveDisabled || saving}>
            <RotateCcw />
            {saving ? "저장 중" : "저장하기"}
          </GlassButton>
        </footer>
      ) : null}
    </>
  );
}

function PartnerCard({ role, children }: { role: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-[22px] border border-session-glass-line bg-session-glass px-[26px] py-6 text-center backdrop-blur-xl">
      <p className="text-subtitle-sm font-bold tracking-widest text-accent-glow uppercase">
        {role}
      </p>
      <p className="text-heading-md font-bold text-balance text-white">{children}</p>
    </div>
  );
}

function RecordOrb({
  phase,
  disabled,
  recording,
  recorded,
  onClick,
}: {
  phase: RecordingPhase;
  disabled: boolean;
  recording: boolean;
  recorded: boolean;
  onClick: () => void;
}) {
  const Icon = recording ? Square : Mic;

  return (
    <div data-state={phase} className="relative grid size-[184px] shrink-0 place-items-center">
      <span
        data-recording-halo={recording || undefined}
        className={cn(
          "pointer-events-none absolute size-[184px] rounded-full border",
          recording ? "border-red-primary" : "border-accent-glow/70",
        )}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={recording ? "녹음 중지" : recorded ? "다시 녹음" : "녹음 시작"}
        onClick={onClick}
        className={cn(
          "relative z-10 inline-flex size-[132px] items-center justify-center rounded-full text-white shadow-[0px_10px_30px_-10px_rgba(20,30,45,0.55)] transition-transform focus-visible:ring-4 focus-visible:ring-accent-glow/40 focus-visible:outline-none enabled:hover:scale-[1.03] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-11",
          recording ? "bg-red-primary" : "bg-accent-500",
        )}
      >
        <Icon />
      </button>
    </div>
  );
}

function TimerPill({ children, recording }: { children: React.ReactNode; recording: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-session-glass-line bg-session-glass px-[15px] py-2 text-body-4 font-bold text-white tabular-nums">
      <span
        data-rec-dot={recording || undefined}
        aria-hidden="true"
        className="size-[9px] shrink-0 rounded-full bg-red-primary"
      />
      {children}
    </div>
  );
}

function GlassButton({
  className,
  emphasis = "secondary",
  ...props
}: React.ComponentProps<"button"> & { emphasis?: "secondary" | "primary" }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border px-5 text-body-3 font-bold text-white transition-colors focus-visible:ring-2 focus-visible:ring-accent-glow/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-[18px]",
        emphasis === "primary"
          ? "border-accent-600 bg-accent-600 hover:bg-accent-700"
          : "border-session-glass-line bg-session-glass backdrop-blur-xl hover:bg-white/12",
        className,
      )}
      {...props}
    />
  );
}

function getHint(
  phase: RecordingPhase,
  recordingStatus: ReturnType<typeof useRecordingSession>["state"]["status"],
): string {
  if (recordingStatus === "discarded") return "녹음이 너무 짧습니다. 다시 녹음해 주세요";
  if (recordingStatus === "failed") return "녹음을 처리하지 못했습니다. 다시 시도해 주세요";

  switch (phase) {
    case "partner-speaking":
      return "상대방 문장이 끝나면 녹음할 수 있어요";
    case "user-ready":
      return "버튼을 눌러 내 문장을 녹음해 주세요";
    case "recording":
      return "말이 끝나면 버튼을 다시 눌러 주세요";
    case "recorded":
      return "저장하거나 다시 녹음할 수 있어요";
    case "failed":
      return "다시 녹음해 주세요";
    case "ready":
      return "";
  }
}
