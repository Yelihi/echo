"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import { Button } from "@/shared/components";
import { Wordmark } from "@/shared/components/ui/Wordmark";

import { NavigationMenuItem } from "@/widgets/navigation/ui/NavigationMenuItem";
import { Profile } from "@/widgets/navigation/ui/Profile";
import { NAVIGATION_MENU } from "@/widgets/navigation/config/const";

export const NavigationContainer = () => {
  const [open, setOpen] = useState(false);
  const links = NAVIGATION_MENU.map((menu) => <NavigationMenuItem {...menu} key={menu.link} />);
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-card-line bg-card-surface px-6 py-8 lg:flex">
        <Link
          href="/home"
          aria-label="Echo 홈"
          className="w-fit rounded-control focus-visible:outline-brand"
        >
          <Wordmark />
        </Link>
        <p className="mt-14 mb-4 text-body-1 tracking-widest text-gray-text">MY PRACTICE</p>
        <nav aria-label="주요 메뉴" className="flex flex-col gap-2">
          {links}
        </nav>
        <p className="mt-auto pt-10 text-body-2 leading-relaxed text-gray-text">
          Speak. Repeat.
          <br />
          Make it yours.
        </p>
      </aside>
      <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-card-line bg-card-surface px-page-gutter lg:ml-60">
        <div className="hidden text-body-2 tracking-widest text-gray-text lg:block">
          YOUR DAILY ENGLISH PRACTICE
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button variant="ghost" size="icon" aria-label="메뉴 열기">
                <Menu />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-card-surface p-6 shadow-modal">
                <Dialog.Title>
                  <Wordmark />
                </Dialog.Title>
                <Dialog.Description className="mt-3 text-body-3 text-gray-text">
                  매일 조금씩, 나의 영어 연습
                </Dialog.Description>
                <Dialog.Close asChild>
                  <Button
                    className="absolute top-5 right-4"
                    variant="ghost"
                    size="icon"
                    aria-label="메뉴 닫기"
                  >
                    <X />
                  </Button>
                </Dialog.Close>
                <nav
                  aria-label="모바일 주요 메뉴"
                  className="mt-10 flex flex-col gap-2"
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("a")) setOpen(false);
                  }}
                >
                  {links}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Link href="/home" aria-label="Echo 홈">
            <Wordmark />
          </Link>
        </div>
        <Profile />
      </header>
    </>
  );
};
