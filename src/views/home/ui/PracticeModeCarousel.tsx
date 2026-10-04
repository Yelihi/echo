"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/tailwind/utils";
import { practiceModes } from "@/views/home/config/practiceModes";

export function PracticeModeCarousel() {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const mode = practiceModes[active];
  const change = (direction: number) =>
    setActive((index) => (index + direction + practiceModes.length) % practiceModes.length);
  return (
    <>
      <section
        className="mt-5 grid grid-cols-[56%_44%] items-center gap-0 max-md:mt-6.5 max-md:grid-cols-1"
        aria-label="연습 모드 선택"
        aria-roledescription="캐러셀"
        onKeyDown={(event) => {
          if (event.target instanceof HTMLElement && event.target.matches("input,textarea")) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            change(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            change(-1);
          }
        }}
      >
        <div className="min-w-0">
          <div
            className="relative isolate aspect-[1/0.98] w-full max-w-[620px] touch-pan-y [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)] max-editor:aspect-[1/1.1] max-md:mx-auto max-md:aspect-square max-md:max-w-[460px]"
            onTouchStart={(event) => (touchStart.current = event.touches[0].clientX)}
            onTouchCancel={() => {
              touchStart.current = null;
            }}
            onTouchEnd={(event) => {
              if (touchStart.current !== null) {
                const delta = event.changedTouches[0].clientX - touchStart.current;
                if (Math.abs(delta) > 50) change(delta < 0 ? 1 : -1);
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
          <div className="mt-6 flex max-w-[620px] items-center justify-center gap-6 text-[13px] text-practice-muted tabular-nums max-md:mx-auto max-md:mt-2.5">
            <button
              className="grid size-11 cursor-pointer place-items-center text-practice-body hover:text-practice-accent"
              type="button"
              aria-label="이전 연습 모드"
              onClick={() => change(-1)}
            >
              <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
            </button>
            <span>
              <strong className="mr-1.75 font-medium text-practice-ink">
                {String(active + 1).padStart(2, "0")}
              </strong>
              <span aria-hidden> / </span>
              {String(practiceModes.length).padStart(2, "0")}
            </span>
            <button
              className="grid size-11 cursor-pointer place-items-center text-practice-body hover:text-practice-accent"
              type="button"
              aria-label="다음 연습 모드"
              onClick={() => change(1)}
            >
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
        <div
          className="pb-15 pl-17 max-editor:pl-10 max-md:px-1 max-md:pt-6 max-md:pb-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-[11px] tracking-[0.18em] text-practice-muted">{mode.label}</p>
          <h2 className="mt-4.75 text-[clamp(36px,3.9vw,56px)] leading-[1.3] font-medium tracking-[-2px] max-md:mt-2.5 max-md:text-[36px]">
            {mode.name}
          </h2>
          <h3 className="mt-6 text-[23px] leading-[1.6] font-normal tracking-[-0.7px] whitespace-pre-line max-editor:text-[20px] max-md:mt-4">
            {mode.title}
          </h3>
          <p className="mt-5 text-[14px] leading-[1.9] whitespace-pre-line text-practice-muted max-editor:whitespace-normal max-md:mt-4">
            {mode.description}
          </p>
          <Link
            className="mt-9 inline-flex items-center gap-8.75 border-b border-practice-ink py-3.5 text-[17px] font-medium hover:border-practice-accent hover:text-practice-accent max-md:mt-5"
            href={mode.href}
            aria-label={`${mode.name} 시작하기`}
          >
            연습 시작하기 <ArrowRight size={23} strokeWidth={1.5} aria-hidden />
          </Link>
          <p className="mt-5 text-[11px] text-practice-muted max-md:mt-3.5">{mode.note}</p>
        </div>
      </section>
      <nav
        className="mt-6 flex justify-end gap-9 border-t border-practice-panel-line pt-5.25 max-md:mt-7 max-md:justify-start"
        aria-label="연습 모드 바로 선택"
      >
        {practiceModes.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className="relative flex cursor-pointer items-center gap-3 py-2.5 text-[13px] text-practice-muted aria-pressed:text-practice-ink aria-pressed:before:absolute aria-pressed:before:-top-5.5 aria-pressed:before:h-0.5 aria-pressed:before:w-full aria-pressed:before:bg-practice-accent"
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <span className="text-[10px] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </>
  );
}
