import type { MaterialKind } from "../models/interface";
import { Suspense } from "react";
import { getMyPageMaterials } from "@/views/my-page/services/server/getMyPageMaterials";
import { getPracticeStats } from "@/views/my-page/services/server/getPracticeStats";
import {
  MyPageContent,
  MyPageMaterialRows,
  MyPageStatistics,
  MyPageRowsLoading,
} from "./MyPageContent";

export function MyPageView() {
  return (
    <MyPageContent
      roleplay={
        <Suspense fallback={<MyPageRowsLoading />}>
          <RecentMaterials type="roleplay" />
        </Suspense>
      }
      memorization={
        <Suspense fallback={<MyPageRowsLoading />}>
          <RecentMaterials type="memorization" />
        </Suspense>
      }
      statistics={
        <Suspense fallback={<MyPageRowsLoading />}>
          <PracticeStatistics />
        </Suspense>
      }
    />
  );
}
async function RecentMaterials({ type }: { type: MaterialKind }) {
  return <MyPageMaterialRows items={await getMyPageMaterials(type)} />;
}
async function PracticeStatistics() {
  return <MyPageStatistics stats={await getPracticeStats()} />;
}
