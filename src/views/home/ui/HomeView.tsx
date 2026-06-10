// features
import { LogoutButton } from "@/features/logout";

export function HomeView() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold m-0">english-speaking-practice</h1>
      <p className="text-base text-gray-500 m-0">FSD(Feature-Sliced Design) 기반 프로젝트입니다.</p>
      <LogoutButton>로그아웃 진행하기</LogoutButton>
    </main>
  );
}
