"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/shared/lib/supabase/client";

export function useLogoutSupabaseInClient() {
  const router = useRouter();
  const client = getSupabaseBrowserClient();

  const handleLogout = async () => {
    const { error } = await client.auth.signOut();

    // 로그아웃 후 세션 변경 사항을 Next.js 서버에 반영하기 위해 refresh 후 이동
    router.refresh();
    router.push("/login");

    return {
      error,
    };
  };

  return {
    handleLogout,
  };
}
