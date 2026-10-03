import { Suspense } from "react";

import {
  HomeMemorizationSessionLatestList,
  HomeMemorizationSessionLatestListFallback,
} from "@/views/home/ui/HomeMemorizationSessionLatestList";
import { HomeLatestStudyRecords } from "@/views/home/ui/HomeLatestStudyRecords";
import {
  HomeRoleplaySessionLatestList,
  HomeRoleplaySessionLatestListFallback,
} from "@/views/home/ui/HomeRoleplaySessionLatestList";
import {
  HomeSessionIntroCard,
  HomeSessionIntroCardFallback,
} from "@/views/home/ui/HomeSessionIntroCard";

/**
 * 홈 화면.
 */
export function HomeView() {
  return (
    <section className="flex w-full flex-col items-start gap-10 sm:gap-12">
      <header className="flex flex-col items-start gap-4">
        <h1 className="text-display break-keep text-black-primary">오늘도 한 문장씩 말해볼까요?</h1>
        <p className="text-body-4 text-gray-text">
          롤플레잉으로 대화하고, 긴 문장은 암기로 다져요.
        </p>
      </header>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<HomeSessionIntroCardFallback type="role-play" />}>
          <HomeSessionIntroCard type="role-play" />
        </Suspense>
        <Suspense fallback={<HomeSessionIntroCardFallback type="memorization" />}>
          <HomeSessionIntroCard type="memorization" />
        </Suspense>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<HomeRoleplaySessionLatestListFallback />}>
          <HomeRoleplaySessionLatestList />
        </Suspense>
        <Suspense fallback={<HomeMemorizationSessionLatestListFallback />}>
          <HomeMemorizationSessionLatestList />
        </Suspense>
      </div>

      <HomeLatestStudyRecords />
    </section>
  );
}
