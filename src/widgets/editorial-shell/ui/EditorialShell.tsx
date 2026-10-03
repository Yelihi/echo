"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import {
  House,
  MessageCircleMore,
  BookOpen,
  ChartNoAxesColumn,
  Mic,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { Profile } from "@/widgets/navigation/ui/Profile";
import styles from "./EditorialShell.module.css";

const groups = [
  { title: null, items: [{ href: "/home", label: "홈", icon: House }] },
  {
    title: "연습",
    items: [
      { href: "/role-playing", label: "롤플레잉", icon: MessageCircleMore },
      { href: "/sentence-memorization", label: "문단 암기", icon: BookOpen },
    ],
  },
  {
    title: "내 활동",
    items: [
      { href: "/sessions", label: "학습 기록", icon: ChartNoAxesColumn },
      { href: "/recording-management", label: "녹음 관리", icon: Mic },
    ],
  },
];

export function EditorialShell({ children, initials }: { children: ReactNode; initials?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = (
    <>
      <Link
        href="/home"
        className={styles.wordmark}
        aria-label="Echo 홈"
        onClick={() => setOpen(false)}
      >
        echo<span>.</span>
      </Link>
      <nav aria-label="주요 메뉴" className={styles.navigation}>
        {groups.map((group, index) => (
          <div className={styles.group} key={index}>
            {group.title && <p className={styles.groupTitle}>{group.title}</p>}
            {group.items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={styles.navItem}
                onClick={() => setOpen(false)}
              >
                <Icon aria-hidden size={23} strokeWidth={1.7} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className={styles.learner}>
        <span className={styles.avatar}>{initials || <UserRound aria-hidden size={24} />}</span>
        <div>
          <p>학습자</p>
          <p>안녕하세요!</p>
        </div>
      </div>
    </>
  );
  return (
    <div className={styles.shell}>
      <a href="#home-content" className={styles.skip}>
        본문으로 이동
      </a>
      <aside className={styles.sidebar}>{navigation}</aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className={styles.mobileMenu} aria-label="메뉴 열기">
              <Menu aria-hidden />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.overlay} />
              <Dialog.Content className={styles.drawer} aria-describedby={undefined}>
                <Dialog.Title className="sr-only">Echo 메뉴</Dialog.Title>
                <Dialog.Close className={styles.close} aria-label="메뉴 닫기">
                  <X aria-hidden />
                </Dialog.Close>
                {navigation}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <span>홈</span>
          <div className={styles.profile}>
            <Profile initials={initials} />
          </div>
        </header>
        <main id="home-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
