import { Suspense } from "react";
import { getHomeMaterials } from "@/views/home/services/getHomeMaterials";
import { getLatestStudySessions } from "@/widgets/latest-sessions/services/server/getLatestStudySessions";
import {
  HomeContent,
  HomeMaterialRows,
  HomeHistoryRows,
  HomeRowsLoading,
} from "./editorial/HomeContent";

export function HomeView() {
  return (
    <HomeContent
      date={new Date()}
      roleplay={
        <Suspense fallback={<HomeRowsLoading />}>
          <RecentMaterials type="roleplay" />
        </Suspense>
      }
      memorization={
        <Suspense fallback={<HomeRowsLoading />}>
          <RecentMaterials type="memorization" />
        </Suspense>
      }
      history={
        <Suspense fallback={<HomeRowsLoading />}>
          <RecentHistory />
        </Suspense>
      }
    />
  );
}

async function RecentMaterials({ type }: { type: "roleplay" | "memorization" }) {
  return <HomeMaterialRows items={await getHomeMaterials(type)} />;
}
async function RecentHistory() {
  return <HomeHistoryRows sessions={await getLatestStudySessions(2)} />;
}
