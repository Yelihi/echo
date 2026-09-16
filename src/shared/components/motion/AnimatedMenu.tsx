"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";

type MenuProps = { children: ReactNode; className: string; id?: string };

function MenuSurface({ children, ...props }: MenuProps) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!present && ref.current?.contains(document.activeElement)) {
      ref.current.parentElement?.querySelector<HTMLButtonElement>("button[aria-controls]")?.focus();
    }
  }, [present]);
  return (
    <motion.div
      {...props}
      ref={ref}
      data-slot="animated-menu"
      inert={!present}
      aria-hidden={!present || undefined}
      initial={reduced ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -4 }}
      transition={{ duration: reduced ? 0 : present ? 0.16 : 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedMenu({ open, ...props }: MenuProps & { open: boolean }) {
  return <AnimatePresence>{open && <MenuSurface {...props} />}</AnimatePresence>;
}
