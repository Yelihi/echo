import Link from "next/link";

import { AppShell } from "@/widgets/app-shell";

export default function RolePlayingReadyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div
        data-pillar="roleplay"
        className="min-h-full bg-surface-app-warm px-page-gutter py-10 sm:py-14 text-black-primary"
      >
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/role-playing"
            aria-label="롤플레잉 목록으로 돌아가기"
            className="mb-8 inline-flex min-h-11 items-center gap-1 rounded-pill px-2.5 text-body-2 font-medium text-black-secondary hover:bg-wash-6 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span aria-hidden="true">←</span>
            롤플레잉 자료
          </Link>
          <div className="flex flex-col gap-10">{children}</div>
        </div>
      </div>
    </AppShell>
  );
}
