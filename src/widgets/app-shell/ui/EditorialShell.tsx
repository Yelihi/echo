"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { ArrowLeft, BookOpen, Files, Plus, Menu, X, History, Mic, UserRound } from "lucide-react";
import { Profile } from "@/features/logout/ui/Profile";
import type { EditorialShellProps } from "../models/editorialShell";
import { getShellRoute } from "../models/getShellRoute";
import styles from "./EditorialShell.module.css";

export function EditorialShell({ children, initials, pathname }: EditorialShellProps) {
  const [open, setOpen] = useState(false);
  const { inPractice, base, mode, page } = getShellRoute(pathname);
  const brand = (
    <Link
      href="/home"
      className={styles.wordmark}
      aria-label="Echo 홈"
      onClick={() => setOpen(false)}
    >
      echo<span>.</span>
    </Link>
  );
  const navigation = (
    <>
      {brand}
      <Link className={styles.back} href="/home" onClick={() => setOpen(false)}>
        <ArrowLeft size={15} aria-hidden /> 연습 선택으로
      </Link>
      <nav aria-label="연습 메뉴" className={styles.navigation}>
        <p className={styles.groupTitle}>{mode}</p>
        {[
          { href: base, label: "자료 목록", icon: Files },
          { href: `${base}/new`, label: "새 자료 만들기", icon: Plus },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className={styles.navItem}
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
        <p className={styles.groupTitle}>내 활동</p>
        {[
          { href: "/my-page", label: "마이페이지", icon: UserRound },
          { href: "/sessions", label: "학습 기록", icon: History },
          { href: "/recording-management", label: "녹음 관리", icon: Mic },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={styles.navItem} onClick={() => setOpen(false)}>
            <Icon size={17} strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.sidebarFoot}>
        <BookOpen size={16} strokeWidth={1.5} aria-hidden />
        <span>작은 연습이 쌓이는 곳.</span>
      </div>
    </>
  );
  return (
    <div className={styles.shell} data-practice={inPractice || undefined}>
      <a href="#main-content" className={styles.skip}>
        본문으로 이동
      </a>
      {inPractice && <aside className={styles.sidebar}>{navigation}</aside>}
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          {inPractice ? (
            <>
              <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger className={styles.mobileMenu} aria-label="메뉴 열기">
                  <Menu size={21} aria-hidden />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className={styles.overlay} />
                  <Dialog.Content className={styles.drawer} aria-describedby={undefined}>
                    <Dialog.Title className="sr-only">Echo 메뉴</Dialog.Title>
                    <Dialog.Close className={styles.close} aria-label="메뉴 닫기">
                      <X size={20} aria-hidden />
                    </Dialog.Close>
                    {navigation}
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <div className={styles.breadcrumb}>
                <span>{mode}</span>
                <span aria-hidden>/</span>
                <span>{page}</span>
              </div>
            </>
          ) : (
            brand
          )}
          <nav aria-label="상단 메뉴" className={styles.topNavigation}>
            <Link href="/home" aria-current={pathname === "/home" ? "page" : undefined}>
              연습 선택
            </Link>
            <Link
              href="/my-page"
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
          <div className={styles.profile}>
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
