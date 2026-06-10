import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 로그인 성공 후 최종적으로 이동할 페이지 (예: 대시보드)
  const nextPath = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createSupabaseServerClient();

    // 코드를 세션으로 교환하여 쿠키에 저장
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  }

  // 에러 발생 시 메인 페이지나 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
