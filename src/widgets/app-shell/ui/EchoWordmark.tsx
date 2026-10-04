import Link from "next/link";
import type { EchoWordmarkProps } from "../models/editorialShell";
export function EchoWordmark({ onNavigate }: EchoWordmarkProps) {
  return (
    <Link
      href="/home"
      className="block w-fit font-[Arial,sans-serif] text-[34px] leading-none font-bold tracking-[-1.6px] text-practice-ink max-compact:text-[29px]"
      aria-label="Echo 홈"
      onClick={onNavigate}
    >
      echo<span className="text-practice-accent">.</span>
    </Link>
  );
}
