"use client";

import { useState, type KeyboardEvent } from "react";
import { practiceModes } from "../config/const";
import { PracticeModePhoto } from "./PracticeModePhoto";
import { PracticeModeControls } from "./PracticeModeControls";
import { PracticeModeDetails } from "./PracticeModeDetails";
import { PracticeModeNavigation } from "./PracticeModeNavigation";

export function PracticeModeSelector() {
  const [active, setActive] = useState(0);
  const step = (direction: number) =>
    setActive((index) => (index + direction + practiceModes.length) % practiceModes.length);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target instanceof HTMLElement && event.target.matches("input,textarea")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    }
  };
  return (
    <>
      <section
        className="mt-5 grid grid-cols-[56%_44%] items-center gap-0 max-md:mt-6.5 max-md:grid-cols-1"
        aria-label="연습 모드 선택"
        aria-roledescription="캐러셀"
        onKeyDown={handleKeyDown}
      >
        <div className="min-w-0">
          <PracticeModePhoto active={active} onStep={step} />
          <PracticeModeControls active={active} onStep={step} />
        </div>
        <PracticeModeDetails mode={practiceModes[active]} />
      </section>
      <PracticeModeNavigation active={active} onSelect={setActive} />
    </>
  );
}
