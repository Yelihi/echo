"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Animate the existing DOM; never key/remount stateful page children. */
export function PageEnter({
  children,
  transitionKey,
}: {
  children: ReactNode;
  transitionKey?: string;
}) {
  const pathname = usePathname();
  const route = transitionKey ?? pathname;
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reduced.matches || !element.animate) return;
    const style = getComputedStyle(element);
    const animation = element.animate(
      [
        {
          opacity: 0,
          transform: `translateX(${style.getPropertyValue("--motion-page-distance")})`,
        },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: parseFloat(style.getPropertyValue("--motion-page-duration")),
        easing: style.getPropertyValue("--motion-ease").trim(),
      },
    );
    const stop = () => {
      if (reduced.matches) animation.cancel();
    };
    reduced.addEventListener("change", stop);
    return () => {
      animation.cancel();
      reduced.removeEventListener("change", stop);
    };
  }, [route]);

  return (
    <div ref={ref} data-slot="page-enter" className="flex min-h-0 w-full flex-1 flex-col">
      {children}
    </div>
  );
}
