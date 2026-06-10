import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. 미들웨어 전용 서버 클라이언트 생성
  const supabase = await createSupabaseServerClient();

  // 2. 현재 로그인된 유저 정보 요청 (안전한 인증 검사)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. 가드 조건 설정
  // 로그인을 안 한 상태로 대시보드(/dashboard) 등의 보호된 페이지에 접근할 때
  const protectedRoutes = [
    "/home",
    "/roleplays",
    "/memorization",
    "/recordings",
    "/roleplay-sessions",
    "/memorization-sessions",
  ];
  if (!user && protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 이미 로그인된 상태로 로그인 페이지(/login)에 접근할 때 메인이나 대시보드로 리다이렉트
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return response;
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: [
    /*
     * 다음으로 시작하는 경로를 제외한 모든 요청 경로에 미들웨어 적용:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     * - 이미지 파일 확장자들 (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
