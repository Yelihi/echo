import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { AppShell } from "@/widgets/app-shell";

/**
 * 보호 영역 레이아웃.
 *
 * proxy(미들웨어)도 같은 리다이렉트를 하지만, 미들웨어는 matcher 설정이나
 * 배포 환경에 따라 우회될 수 있어 레이아웃에서 한 번 더 확인합니다.
 * 이 검사가 서버 컴포넌트에서 세션을 확정하는 지점입니다.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
