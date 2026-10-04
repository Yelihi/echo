import { ArrowLeft, ArrowRight } from "lucide-react";
import { practiceModes } from "../config/const";
import type { PracticeModeControlsProps } from "../models/interface";
export function PracticeModeControls({ active, onStep }: PracticeModeControlsProps) {
  return (
    <div className="mt-6 flex max-w-[620px] items-center justify-center gap-6 text-[13px] text-practice-muted tabular-nums max-md:mx-auto max-md:mt-2.5">
      <button
        className="grid size-11 cursor-pointer place-items-center text-practice-body hover:text-practice-accent"
        type="button"
        aria-label="이전 연습 모드"
        onClick={() => onStep(-1)}
      >
        <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
      </button>
      <span>
        <strong className="mr-1.75 font-medium text-practice-ink">
          {String(active + 1).padStart(2, "0")}
        </strong>
        <span aria-hidden> / </span>
        {String(practiceModes.length).padStart(2, "0")}
      </span>
      <button
        className="grid size-11 cursor-pointer place-items-center text-practice-body hover:text-practice-accent"
        type="button"
        aria-label="다음 연습 모드"
        onClick={() => onStep(1)}
      >
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
