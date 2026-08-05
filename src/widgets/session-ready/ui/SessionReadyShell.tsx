import Link from "next/link";

import { NavigationContainer } from "@/widgets/navigation/ui/NavigationContainer";
import type { SessionReadyShellProps } from "@/widgets/session-ready/models/interface";

export function SessionReadyShell({
  pillar,
  backHref,
  backLabel,
  children,
}: SessionReadyShellProps) {
  return (
    <main className="min-h-lvh bg-[#fafafa] text-black-primary" data-pillar={pillar}>
      <header className="sticky top-0 z-20 h-[62px]">
        <NavigationContainer />
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
