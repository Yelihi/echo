"use client";

import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/tailwind/utils";
import { practiceModes, PRACTICE_SWIPE_THRESHOLD } from "../config/const";
import type { PracticeModePhotoProps } from "../models/interface";

export function PracticeModePhoto({ active, onStep }: PracticeModePhotoProps) {
  const touchStart = useRef<number | null>(null);
  const mode = practiceModes[active];
  return (
    <div
      className="relative isolate aspect-[1/0.98] w-full max-w-[620px] touch-pan-y [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)] max-editor:aspect-[1/1.1] max-md:mx-auto max-md:aspect-square max-md:max-w-[460px]"
      onTouchStart={(event) => (touchStart.current = event.touches[0].clientX)}
      onTouchCancel={() => {
        touchStart.current = null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current !== null) {
          const delta = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(delta) > PRACTICE_SWIPE_THRESHOLD) onStep(delta < 0 ? 1 : -1);
        }
        touchStart.current = null;
      }}
    >
      {practiceModes.map((item, index) => (
        <Image
          key={item.id}
          src={item.image}
          alt={active === index ? item.imageAlt : ""}
          fill
          sizes="(max-width: 767px) 90vw, 52vw"
          priority={index === 0}
          aria-hidden={active !== index}
          className={cn(
            "object-cover [transition:opacity_450ms_ease,scale_800ms_ease] motion-reduce:transition-none",
            active === index ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-black/20" />
      <p
        className="animate-practice-arrive absolute top-[38%] right-[8%] left-[14%] font-[Arial,sans-serif] text-[clamp(36px,4.3vw,66px)] leading-[1.06] font-semibold tracking-[-2px] whitespace-pre-line text-white max-md:text-[clamp(30px,9vw,46px)] max-md:tracking-[-1.8px] motion-reduce:animate-none"
        key={mode.id}
        aria-hidden
      >
        {mode.imageTitle}
      </p>
    </div>
  );
}
