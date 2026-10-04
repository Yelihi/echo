import Link from "next/link";
import { ArrowLeft, BookOpen, Files, Plus, History, Mic, UserRound } from "lucide-react";
import type { PracticeNavigationProps } from "../models/editorialShell";
import { EchoWordmark } from "./EchoWordmark";
export function PracticeNavigation({ pathname, base, mode, onNavigate }: PracticeNavigationProps) {
  return (
    <>
      <EchoWordmark onNavigate={onNavigate} />
      <Link
        className="mt-11 flex min-h-11 items-center gap-2.5 text-[12px] text-practice-muted"
        href="/home"
        onClick={onNavigate}
      >
        <ArrowLeft size={15} aria-hidden /> 연습 선택으로
      </Link>
      <nav aria-label="연습 메뉴" className="mt-4">
        <p className="mx-3 mt-6 mb-3 text-[11px] tracking-[0.06em] text-practice-muted">{mode}</p>
        {[
          { href: base, label: "자료 목록", icon: Files },
          { href: `${base}/new`, label: "새 자료 만들기", icon: Plus },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className="relative flex min-h-11 items-center gap-2.75 px-3 text-[13px] text-practice-subtle hover:text-practice-ink aria-[current=page]:font-medium aria-[current=page]:text-practice-ink aria-[current=page]:after:absolute aria-[current=page]:after:right-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-4 aria-[current=page]:after:bg-practice-accent"
            aria-current={
              pathname === href || (href === base && pathname.endsWith("/edit"))
                ? "page"
                : undefined
            }
            onClick={onNavigate}
          >
            <Icon size={17} strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        ))}
        <p className="mx-3 mt-6 mb-3 text-[11px] tracking-[0.06em] text-practice-muted">내 활동</p>
        {[
          { href: "/my-page", label: "마이페이지", icon: UserRound },
          { href: "/sessions", label: "학습 기록", icon: History },
          { href: "/recording-management", label: "녹음 관리", icon: Mic },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="relative flex min-h-11 items-center gap-2.75 px-3 text-[13px] text-practice-subtle hover:text-practice-ink aria-[current=page]:font-medium aria-[current=page]:text-practice-ink aria-[current=page]:after:absolute aria-[current=page]:after:right-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-4 aria-[current=page]:after:bg-practice-accent"
            onClick={onNavigate}
          >
            <Icon size={17} strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 px-2.5 pt-6 text-[11px] text-practice-muted">
        <BookOpen size={16} strokeWidth={1.5} aria-hidden />
        <span>작은 연습이 쌓이는 곳.</span>
      </div>
    </>
  );
}
