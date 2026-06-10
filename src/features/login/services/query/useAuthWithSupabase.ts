"use client";

import { getSupabaseBrowserClient } from "@/shared/lib/supabase/client";

// type
import { SupabaseAuthConnectedProvider } from "@/features/login/models/interface";

export function useAuthWithSupabase() {
  const client = getSupabaseBrowserClient();

  const handleAuthWithSupabase = async (provider: SupabaseAuthConnectedProvider) => {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: provider,
      options: {
        // 인증 후 위에서 만든 Route Handler(주소창 기준)로 코드를 보냅니다.
        redirectTo: `${window.location.origin}/auth/callback?next=/home`,
      },
    });

    return {
      data,
      error,
    };
  };

  return {
    handleAuthWithSupabase,
  };
}
