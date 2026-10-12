import type { MaterialKind } from "../models/interface";
import { Suspense } from "react";
import { getMyPageMaterials } from "@/views/my-page/services/server/getMyPageMaterials";
import { getPracticeStats } from "@/views/my-page/services/server/getPracticeStats";
import { UserProfileRepository } from "@/entities/user-profile";
import { DEFAULT_GRAMMAR_DIFFICULTY } from "@/entities/user-profile/models/entity";
import type { UserId } from "@/entities/value-object";
import { getAuthenticatedUser } from "@/shared/lib/supabase/getAuthenticatedUser";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";
import { GrammarDifficultySetting } from "./GrammarDifficultySetting";
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
      difficulty={
        <Suspense fallback={<MyPageRowsLoading />}>
          <PracticeDifficulty />
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

async function PracticeDifficulty() {
  const supabase = await createSupabaseServerClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) redirect("/login");
  try {
    const profile = await new UserProfileRepository(supabase).findById(user.id as UserId);
    return (
      <GrammarDifficultySetting
        initialDifficulty={profile?.exampleDifficulty ?? DEFAULT_GRAMMAR_DIFFICULTY}
      />
    );
  } catch (error) {
    console.error("예문 난이도 조회 실패", error);
    return (
      <p role="alert" className="mt-5 text-[13px] text-practice-error">
        예문 난이도 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }
}
