import Link from "next/link";
import { Plus } from "lucide-react";
import type { MaterialLibraryHeaderProps } from "../models/interface";

export function MaterialLibraryHeader({
  eyebrow,
  title,
  description,
  createHref,
}: MaterialLibraryHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-6 max-compact:flex-col max-compact:items-start max-compact:gap-5">
      <div>
        <p className="text-[10px] tracking-[0.16em] text-practice-muted">{eyebrow}</p>
        <h1 className="mt-2.5 text-[38px] leading-[1.4] font-medium tracking-[-1.4px] max-compact:text-[30px]">
          {title}
        </h1>
        <p className="mt-3 text-[14px] leading-[1.8] text-practice-muted">{description}</p>
      </div>
      <Link
        href={createHref}
        className="inline-flex min-h-11.5 items-center gap-2.5 rounded-[7px] bg-practice-accent px-4.5 text-[13px] whitespace-nowrap text-white hover:bg-practice-accent-hover max-compact:self-end"
      >
        <Plus size={16} aria-hidden />새 자료 만들기
      </Link>
    </header>
  );
}
