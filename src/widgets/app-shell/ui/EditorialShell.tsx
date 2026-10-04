"use client";

import Link from "next/link";
import { Profile } from "@/features/logout/ui/Profile";
import type { EditorialShellProps } from "../models/editorialShell";
import { getShellRoute } from "../models/getShellRoute";
import { EchoWordmark } from "./EchoWordmark";
import { PracticeNavigation } from "./PracticeNavigation";
import { PracticeMobileMenu } from "./PracticeMobileMenu";

export function EditorialShell({ children, initials, pathname }: EditorialShellProps) {
  const { inPractice, base, mode, page } = getShellRoute(pathname);
  return (
    <div
      className="group/shell min-h-svh bg-white text-practice-ink data-practice:bg-practice-canvas [--color-brand:var(--color-practice-accent)] [--color-brand-hover:var(--color-practice-accent-hover)] [--color-control-line:var(--color-practice-input-line)] [--radius-control:8px] [--radius-card:14px] [--radius-panel:12px] [--text-display:clamp(2rem,3vw,2.75rem)] [--text-display--font-weight:500] [&_[data-slot=page-container]]:max-w-[1440px] [&_[data-slot=page-container]]:p-11 max-lg:[&_[data-slot=page-container]]:px-7 max-lg:[&_[data-slot=page-container]]:py-8 max-compact:[&_[data-slot=page-container]]:px-5 max-compact:[&_[data-slot=page-container]]:py-7 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-practice-focus [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-practice-focus"
      data-practice={inPractice || undefined}
    >
      <a
        href="#main-content"
        className="fixed top-2 left-2 z-100 -translate-y-[200%] bg-white p-3 focus:translate-y-0"
      >
        본문으로 이동
      </a>
      {inPractice && (
        <aside className="fixed inset-y-0 left-0 z-30 flex w-54 flex-col border-r border-practice-line bg-white px-6 py-9 max-lg:hidden">
          <PracticeNavigation pathname={pathname} base={base} mode={mode} />
        </aside>
      )}
      <div className="lg:group-data-practice/shell:ml-54">
        <header
          className={`flex items-center gap-8 max-compact:gap-4.5 ${inPractice ? "h-19 border-b border-practice-line bg-practice-canvas lg:px-11" : "h-25 bg-white lg:px-13"} max-lg:px-7 max-compact:h-19 max-compact:px-5`}
        >
          {inPractice ? (
            <>
              <PracticeMobileMenu pathname={pathname} base={base} mode={mode} />
              <div className="flex items-center gap-3 text-[12px] text-practice-muted [&>span:last-child]:text-practice-body max-compact:hidden">
                <span>{mode}</span>
                <span aria-hidden>/</span>
                <span>{page}</span>
              </div>
            </>
          ) : (
            <EchoWordmark />
          )}
          <nav
            aria-label="상단 메뉴"
            className="ml-auto flex gap-9 text-[14px] text-practice-subtle max-compact:gap-5 max-compact:text-[12px]"
          >
            <Link
              className="relative flex min-h-11 items-center aria-[current=page]:text-practice-ink aria-[current=page]:after:absolute aria-[current=page]:after:bottom-px aria-[current=page]:after:left-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-4.5 aria-[current=page]:after:bg-practice-accent"
              href="/home"
              aria-current={pathname === "/home" ? "page" : undefined}
            >
              연습 선택
            </Link>
            <Link
              href="/my-page"
              className="relative flex min-h-11 items-center aria-[current=page]:text-practice-ink aria-[current=page]:after:absolute aria-[current=page]:after:bottom-px aria-[current=page]:after:left-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-4.5 aria-[current=page]:after:bg-practice-accent"
              aria-current={
                pathname === "/my-page" ||
                pathname === "/sessions" ||
                pathname === "/recording-management"
                  ? "page"
                  : undefined
              }
            >
              마이페이지
            </Link>
          </nav>
          <div className="[&>div]:size-9 [&>div>button]:border [&>div>button]:border-practice-line [&>div>button]:bg-practice-avatar [&>div>button]:text-[12px] [&>div>button]:text-practice-secondary [&_svg]:text-practice-secondary max-compact:[&>div]:size-8">
            <Profile initials={initials} />
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
