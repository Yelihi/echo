import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
export function GrammarNotFound() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-10">
      <BackNavigation href="/grammar" />
      <h1 className="text-2xl font-medium text-practice-ink">노트 또는 연습을 찾을 수 없어요</h1>
      <p className="text-sm text-practice-muted">목록에서 사용할 자료를 다시 선택해 주세요.</p>
    </div>
  );
}
