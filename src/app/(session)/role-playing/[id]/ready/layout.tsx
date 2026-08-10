import Link from "next/link";

import { AppShell } from "@/widgets/app-shell";

export default function RolePlayingReadyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div
        data-pillar="roleplay"
        className="min-h-full bg-surface-app-warm px-4 pt-[30px] pb-10 text-black-primary"
      >
        <div className="mx-auto w-full max-w-[792px]">
          <Link
            href="/role-playing"
            aria-label="롤플레잉 목록으로 돌아가기"
            className="mb-[18px] inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-body-2 font-medium text-black-secondary hover:bg-wash-6"
          >
            <span aria-hidden="true">←</span>
            롤플레잉 자료
          </Link>
          <div className="flex flex-col gap-[26px]">{children}</div>
        </div>
      </div>
    </AppShell>
  );
}
