import "server-only";

import type { createSupabaseServerClient } from "./server";

/** 인증 확인만 공유하고, 실패 시 404·오류 코드 등의 응답은 호출부가 결정한다. */
export async function getAuthenticatedUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data, error } = await supabase.auth.getUser();

  return error ? null : data.user;
}
