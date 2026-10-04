import { AppShell } from "@/widgets/app-shell";

export default function SentenceMemorizationReadyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div
        data-pillar="memo"
        className="min-h-full bg-surface-app-warm px-page-gutter py-10 sm:py-14 text-black-primary"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col gap-10">{children}</div>
        </div>
      </div>
    </AppShell>
  );
}
