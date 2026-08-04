import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { SessionReadyShellProps } from "@/widgets/session-ready/models/interface";

export function SessionReadyShell({
  pillar,
  backHref,
  backLabel,
  currentStep = 0,
  totalSteps,
  children,
}: SessionReadyShellProps) {
  const progress = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0;

  return (
    <main
      className="relative min-h-lvh overflow-hidden bg-session-bg text-white"
      data-pillar={pillar}
    >
      <div className="pointer-events-none absolute inset-x-[-10%] top-[-45%] h-[70vh] rounded-full bg-accent-600/30 blur-3xl" />

      <header className="relative z-10 flex h-20 items-center gap-4 px-6">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-session-glass-line bg-session-glass text-white outline-none transition-colors hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-accent-glow/50"
        >
          <ArrowLeft className="size-4.5" />
        </Link>
        <div className="h-1.25 flex-1 overflow-hidden rounded-full bg-session-glass">
          <div className="h-full rounded-full bg-accent-glow" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-12 text-right text-body-3 font-bold tabular-nums text-white/80">
          {currentStep} / {totalSteps}
        </span>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 px-6 pb-12 pt-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        {children}
      </section>
    </main>
  );
}
