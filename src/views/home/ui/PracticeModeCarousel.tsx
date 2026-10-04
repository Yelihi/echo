"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { practiceModes } from "@/views/home/config/practiceModes";
import styles from "./PracticeHub.module.css";

export function PracticeModeCarousel() {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const mode = practiceModes[active];
  const change = (direction: number) =>
    setActive((index) => (index + direction + practiceModes.length) % practiceModes.length);
  return (
    <>
      <section
        className={styles.carousel}
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
        <div className={styles.visualColumn}>
          <div
            className={styles.picture}
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
                className={active === index ? styles.visibleImage : styles.hiddenImage}
              />
            ))}
            <div className={styles.imageShade} />
            <p className={styles.imageTitle} key={mode.id} aria-hidden>
              {mode.imageTitle}
            </p>
          </div>
          <div className={styles.controls}>
            <button type="button" aria-label="이전 연습 모드" onClick={() => change(-1)}>
              <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
            </button>
            <span>
              <strong>{String(active + 1).padStart(2, "0")}</strong>
              <span aria-hidden> / </span>
              {String(practiceModes.length).padStart(2, "0")}
            </span>
            <button type="button" aria-label="다음 연습 모드" onClick={() => change(1)}>
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
        <div className={styles.copy} aria-live="polite" aria-atomic="true">
          <p className={styles.eyebrow}>{mode.label}</p>
          <h2>{mode.name}</h2>
          <h3>{mode.title}</h3>
          <p className={styles.description}>{mode.description}</p>
          <Link className={styles.start} href={mode.href} aria-label={`${mode.name} 시작하기`}>
            연습 시작하기 <ArrowRight size={23} strokeWidth={1.5} aria-hidden />
          </Link>
          <p className={styles.note}>{mode.note}</p>
        </div>
      </section>
      <nav className={styles.modeNavigation} aria-label="연습 모드 바로 선택">
        {practiceModes.map((item, index) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </>
  );
}
