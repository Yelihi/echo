import { PageContainer } from "@/widgets/app-shell";
import { SessionSimplifiedSkeleton } from "@/widgets/latest-sessions/ui/SessionSimplified";

export default function Loading() {
  return (
    <PageContainer>
      <section aria-busy="true" aria-label="학습 기록 불러오는 중" className="space-y-6">
        <h1 className="text-heading-md font-bold text-black-primary">학습 기록</h1>
        <div className="h-10 w-64 animate-pulse rounded-md bg-neutral-100" />
        <div className="space-y-2.5">
          {Array.from({ length: 10 }, (_, index) => (
            <SessionSimplifiedSkeleton key={index} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
