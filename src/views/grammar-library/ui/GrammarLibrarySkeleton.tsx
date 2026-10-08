export function GrammarLibrarySkeleton() {
  return (
    <div role="status" aria-label="어법 노트를 불러오는 중" className="space-y-6 p-8">
      <span className="sr-only">어법 노트를 불러오는 중입니다.</span>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className="space-y-4 border-b border-practice-line py-5 motion-safe:animate-pulse"
        >
          <div className="h-6 w-1/3 rounded bg-practice-line" />
          <div className="h-4 w-2/3 rounded bg-practice-line" />
        </div>
      ))}
    </div>
  );
}
