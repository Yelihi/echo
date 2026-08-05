import { BarChart3, Layers, MessageSquare } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { Profile } from "@/widgets/navigation/ui/Profile";
import type { SessionReadyShellProps } from "@/widgets/session-ready/models/interface";

export function SessionReadyShell({
  pillar,
  backHref,
  backLabel,
  children,
}: SessionReadyShellProps) {
  return (
    <main className="min-h-lvh bg-[#fafafa] text-black-primary" data-pillar={pillar}>
      <header className="sticky top-0 z-20 h-[62px] border-b border-card-line bg-white-secondary/65 px-6 backdrop-blur-[11px]">
        <div className="mx-auto flex h-full max-w-[1392px] items-center gap-[26px]">
          <Link href="/home" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-chip bg-blue-primary text-body-3 font-bold text-white shadow-[0_2px_6px_-2px_rgba(45,58,75,0.4)]">
              E
            </span>
            <span className="text-heading-sm font-bold text-black-primary">Echo</span>
          </Link>

          <nav aria-label="주요 메뉴" className="flex min-w-0 flex-1 items-center gap-0.5">
            <TopNavLink
              href="/role-playing"
              active={pillar === "roleplay"}
              icon={<MessageSquare />}
            >
              롤플레이
            </TopNavLink>
            <TopNavLink href="/sentence-memorization" active={pillar === "memo"} icon={<Layers />}>
              암기
            </TopNavLink>
            <TopNavLink href="/recording-management" active={false} icon={<BarChart3 />}>
              기록
            </TopNavLink>
          </nav>

          <Profile />
        </div>
      </header>

      <section className="mx-auto w-full max-w-[792px] px-4 pb-10 pt-[30px]">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="mb-[18px] inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-body-2 font-medium text-black-secondary hover:bg-wash-6"
        >
          <span aria-hidden="true">←</span>
          {pillar === "roleplay" ? "롤플레잉 자료" : "암기 자료"}
        </Link>

        <div className="flex flex-col gap-[26px]">{children}</div>
      </section>
    </main>
  );
}

function TopNavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="flex items-center gap-1.5 rounded-chip px-3.5 py-2 text-body-3 font-bold text-gray-text transition-colors hover:bg-accent-50 hover:text-accent-700 aria-[current=page]:bg-accent-50 aria-[current=page]:text-accent-700 [&_svg]:size-[17px]"
    >
      {icon}
      {children}
    </Link>
  );
}
