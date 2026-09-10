import Link from "next/link";
import { Home, List } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ResultNavigation() {
  return (
    <footer className="mt-12 border-t border-gray-border pt-8">
      <nav aria-label="결과 페이지 이동" className="flex flex-wrap justify-center gap-3">
        <Button size="lg" variant="outline" asChild>
          <Link href="/sessions">
            <List className="size-4" />
            세션 목록
          </Link>
        </Button>
        <Button size="lg" asChild>
          <Link href="/home">
            <Home className="size-4" />
            메인으로 가기
          </Link>
        </Button>
      </nav>
    </footer>
  );
}
