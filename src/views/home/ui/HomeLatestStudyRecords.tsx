import { Suspense } from "react";
import Link from "next/link";

import {
  SESSION_SIMPLIFIED_SKELETON_COUNT,
  SessionSimplifiedSkeleton,
} from "@/widgets/latest-sessions/ui/SessionSimplified";
import { HomeLatestStudyRecordList } from "@/views/home/ui/HomeLatestStudyRecordList";

export function HomeLatestStudyRecords() {
  return (
    <section className="flex w-full flex-col gap-3" aria-labelledby="recent-sessions-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="recent-sessions-title" className="text-heading-xs font-bold text-black-primary">
          최근 학습 기록
        </h2>
        <Link href="/sessions" className="text-body-3 font-medium text-blue-primary">
          전체 보기
        </Link>
      </div>
      <Suspense fallback={<HomeLatestStudyRecordsFallback />}>
        <HomeLatestStudyRecordList />
      </Suspense>
    </section>
  );
}

function HomeLatestStudyRecordsFallback() {
  return (
    <div className="flex w-full flex-col gap-2.5" aria-hidden>
      {Array.from({ length: SESSION_SIMPLIFIED_SKELETON_COUNT }, (_, index) => (
        <SessionSimplifiedSkeleton key={index} />
      ))}
    </div>
  );
}
