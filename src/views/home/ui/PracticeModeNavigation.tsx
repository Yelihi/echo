import { practiceModes } from "../config/const";
import type { PracticeModeNavigationProps } from "../models/interface";
export function PracticeModeNavigation({ active, onSelect }: PracticeModeNavigationProps) {
  return (
    <nav
      className="mt-6 flex justify-end gap-9 border-t border-practice-panel-line pt-5.25 max-md:mt-7 max-md:justify-start"
      aria-label="연습 모드 바로 선택"
    >
      {practiceModes.map((item, index) => (
        <button
          type="button"
          key={item.id}
          className="relative flex cursor-pointer items-center gap-3 py-2.5 text-[13px] text-practice-muted aria-pressed:text-practice-ink aria-pressed:before:absolute aria-pressed:before:-top-5.5 aria-pressed:before:h-0.5 aria-pressed:before:w-full aria-pressed:before:bg-practice-accent"
          aria-pressed={active === index}
          onClick={() => onSelect(index)}
        >
          <span className="text-[10px] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          {item.name}
        </button>
      ))}
    </nav>
  );
}
