export function GrammarScreenSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="어법 화면 불러오는 중"
      className="mx-auto max-w-5xl space-y-8 px-5 py-10 motion-safe:animate-pulse"
    >
      <div className="h-6 w-20 rounded bg-practice-chip" />
      <div className="h-10 w-3/5 rounded bg-practice-chip" />
      <div className="h-72 rounded-2xl bg-practice-chip" />
      <div className="h-40 rounded-2xl bg-practice-chip" />
    </div>
  );
}
