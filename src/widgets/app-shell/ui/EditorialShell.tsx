"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { ArrowLeft, BookOpen, Files, Plus, Menu, X, History, Mic, UserRound } from "lucide-react";
import { Profile } from "@/features/logout/ui/Profile";
import type { EditorialShellProps } from "../models/editorialShell";
import { getShellRoute } from "../models/getShellRoute";

export function EditorialShell({ children, initials, pathname }: EditorialShellProps) {
  const [open, setOpen] = useState(false);
  const { inPractice, base, mode, page } = getShellRoute(pathname);
  const navItemClassName =
    "relative flex min-h-11 items-center gap-2.75 px-3 text-[13px] text-practice-subtle hover:text-practice-ink aria-[current=page]:font-medium aria-[current=page]:text-practice-ink aria-[current=page]:after:absolute aria-[current=page]:after:right-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-4 aria-[current=page]:after:bg-practice-accent";
  const topLinkClassName =
    "relative flex min-h-11 items-center aria-[current=page]:text-practice-ink aria-[current=page]:after:absolute aria-[current=page]:after:bottom-px aria-[current=page]:after:left-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-4.5 aria-[current=page]:after:bg-practice-accent";
  const brand = (
    <Link
      href="/home"
      className="block w-fit font-[Arial,sans-serif] text-[34px] leading-none font-bold tracking-[-1.6px] text-practice-ink max-compact:text-[29px]"
      aria-label="Echo 홈"
      onClick={() => setOpen(false)}
    >
      echo<span className="text-practice-accent">.</span>
    </Link>
  );
  const navigation = (
    <>
      {brand}
      <Link
        className="mt-11 flex min-h-11 items-center gap-2.5 text-[12px] text-practice-muted"
        href="/home"
        onClick={() => setOpen(false)}
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
            className={navItemClassName}
            aria-current={
              pathname === href || (href === base && pathname.endsWith("/edit"))
                ? "page"
                : undefined
            }
            onClick={() => setOpen(false)}
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
          <Link key={href} href={href} className={navItemClassName} onClick={() => setOpen(false)}>
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
          {navigation}
        </aside>
      )}
      <div className="lg:group-data-practice/shell:ml-54">
        <header
          className={`flex items-center gap-8 max-compact:gap-4.5 ${inPractice ? "h-19 border-b border-practice-line bg-practice-canvas lg:px-11" : "h-25 bg-white lg:px-13"} max-lg:px-7 max-compact:h-19 max-compact:px-5`}
        >
          {inPractice ? (
            <>
              <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger
                  className="-ml-2.5 hidden size-11 place-items-center max-lg:grid"
                  aria-label="메뉴 열기"
                >
                  <Menu size={21} aria-hidden />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-70 bg-black/33" />
                  <Dialog.Content
                    className="fixed inset-y-0 left-0 z-80 flex w-[min(286px,85vw)] flex-col bg-white px-6 py-9 text-practice-ink [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-practice-focus [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-practice-focus"
                    aria-describedby={undefined}
                  >
                    <Dialog.Title className="sr-only">Echo 메뉴</Dialog.Title>
                    <Dialog.Close
                      className="absolute top-7 right-4 grid size-11 place-items-center"
                      aria-label="메뉴 닫기"
                    >
                      <X size={20} aria-hidden />
                    </Dialog.Close>
                    {navigation}
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <div className="flex items-center gap-3 text-[12px] text-practice-muted [&>span:last-child]:text-practice-body max-compact:hidden">
                <span>{mode}</span>
                <span aria-hidden>/</span>
                <span>{page}</span>
              </div>
            </>
          ) : (
            brand
          )}
          <nav
            aria-label="상단 메뉴"
            className="ml-auto flex gap-9 text-[14px] text-practice-subtle max-compact:gap-5 max-compact:text-[12px]"
          >
            <Link
              className={topLinkClassName}
              href="/home"
              aria-current={pathname === "/home" ? "page" : undefined}
            >
              연습 선택
            </Link>
            <Link
              href="/my-page"
              className={topLinkClassName}
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
