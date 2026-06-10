import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 로그인 성공 후 최종적으로 이동할 페이지 (예: 대시보드)
  const nextPath = searchParams.get("next") ?? "/home";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Server Component에서 호출될 경우 setAll이 실패할 수 있으나,
              // Middleware에서 처리되므로 안전합니다.
            }
          },
        },
      },
    );

    // 코드를 세션으로 교환하여 쿠키에 저장
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  }

  // 에러 발생 시 메인 페이지나 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
