// features
import { LogoutButton } from "@/features/logout";

/**
 * 홈 화면.
 *
 * 아직 플레이스홀더입니다 — 대시보드 구성은 이슈 #25 에서 채웁니다.
 * 셸(`widgets/app-shell`)이 이미 `main` 과 배경을 제공하므로 여기서는
 * 콘텐츠만 그립니다.
 */
export function HomeView() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-heading-lg font-bold text-black-primary">english-speaking-practice</h1>
      <p className="text-body-4 text-gray-text">FSD(Feature-Sliced Design) 기반 프로젝트입니다.</p>
      <LogoutButton>로그아웃 진행하기</LogoutButton>
    </section>
  );
}
