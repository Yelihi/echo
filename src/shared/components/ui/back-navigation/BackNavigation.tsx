import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { BackNavigationProps } from "./interface";

export function BackNavigation({ href, onBack, disabled = false }: BackNavigationProps) {
  const content = (
    <>
      <ArrowLeft size={16} aria-hidden />
      뒤로가기
    </>
  );
  return onBack ? (
    <button
      type="button"
      onClick={onBack}
      disabled={disabled}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-[13px] text-practice-secondary transition-colors hover:text-practice-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-practice-focus disabled:cursor-not-allowed disabled:opacity-50"
    >
      {content}
    </button>
  ) : (
    <Link
      href={href}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-[13px] text-practice-secondary transition-colors hover:text-practice-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-practice-focus"
    >
      {content}
    </Link>
  );
}
