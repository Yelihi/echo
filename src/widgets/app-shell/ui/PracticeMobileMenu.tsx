"use client";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import type { PracticeMobileMenuProps } from "../models/editorialShell";
import { PracticeNavigation } from "./PracticeNavigation";
export function PracticeMobileMenu({ pathname, base, mode }: PracticeMobileMenuProps) {
  const [open, setOpen] = useState(false);
  return (
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
          <PracticeNavigation
            pathname={pathname}
            base={base}
            mode={mode}
            onNavigate={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
