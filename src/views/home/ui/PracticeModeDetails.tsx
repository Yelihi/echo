import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PracticeModeDetailsProps } from "../models/interface";
export function PracticeModeDetails({ mode }: PracticeModeDetailsProps) {
  return (
    <div
      className="pb-15 pl-17 max-editor:pl-10 max-md:px-1 max-md:pt-6 max-md:pb-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-[11px] tracking-[0.18em] text-practice-muted">{mode.label}</p>
      <h2 className="mt-4.75 text-[clamp(36px,3.9vw,56px)] leading-[1.3] font-medium tracking-[-2px] max-md:mt-2.5 max-md:text-[36px]">
        {mode.name}
      </h2>
      <h3 className="mt-6 text-[23px] leading-[1.6] font-normal tracking-[-0.7px] whitespace-pre-line max-editor:text-[20px] max-md:mt-4">
        {mode.title}
      </h3>
      <p className="mt-5 text-[14px] leading-[1.9] whitespace-pre-line text-practice-muted max-editor:whitespace-normal max-md:mt-4">
        {mode.description}
      </p>
      <Link
        className="mt-9 inline-flex items-center gap-8.75 border-b border-practice-ink py-3.5 text-[17px] font-medium hover:border-practice-accent hover:text-practice-accent max-md:mt-5"
        href={mode.href}
        aria-label={`${mode.name} 시작하기`}
      >
        연습 시작하기 <ArrowRight size={23} strokeWidth={1.5} aria-hidden />
      </Link>
      <p className="mt-5 text-[11px] text-practice-muted max-md:mt-3.5">{mode.note}</p>
    </div>
  );
}
