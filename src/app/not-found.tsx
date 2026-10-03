import Link from "next/link";
import { Button } from "@/shared/components";
import { Wordmark } from "@/shared/components/ui/Wordmark";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-card-surface px-page-gutter py-10">
      <Link href="/home" aria-label="Echo 홈">
        <Wordmark />
      </Link>
      <section className="m-auto w-full max-w-xl py-20">
        <p className="mb-6 text-body-3 tracking-widest text-brand">404 / PAGE NOT FOUND</p>
        <h1 className="text-display">잠시 길을 잃었네요.</h1>
        <p className="my-8 text-body-4 text-gray-text">
          찾으시는 페이지가 없거나 이동했어요. 홈에서 다시 시작해보세요.
        </p>
        <Button asChild>
          <Link href="/home">홈으로 돌아가기 →</Link>
        </Button>
      </section>
    </main>
  );
}
