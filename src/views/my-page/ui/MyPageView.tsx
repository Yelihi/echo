import { Suspense } from "react";
import { getMyPageMaterials } from "@/views/my-page/services/getMyPageMaterials";
import { getLatestStudySessions } from "@/widgets/latest-sessions/services/server/getLatestStudySessions";
import {
  MyPageContent,
  MyPageMaterialRows,
  MyPageHistoryRows,
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
      history={
        <Suspense fallback={<MyPageRowsLoading />}>
          <RecentHistory />
        </Suspense>
      }
    />
  );
}
async function RecentMaterials({ type }: { type: "roleplay" | "memorization" }) {
  return <MyPageMaterialRows items={await getMyPageMaterials(type)} />;
}
async function RecentHistory() {
  return <MyPageHistoryRows sessions={await getLatestStudySessions(5)} />;
}
