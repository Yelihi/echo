import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  GrammarLibrarySkeleton,
  parseGrammarLibraryQuery,
  grammarLibraryHref,
} from "@/views/grammar-library";
import { GrammarLibraryContent } from "@/views/grammar-library/ui/GrammarLibraryContent";
interface Props {
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}
export default async function GrammarLibraryPage({ searchParams }: Props) {
  const raw = await searchParams;
  const query = parseGrammarLibraryQuery(raw);
  if (
    (raw.page !== undefined && raw.page !== String(query.page)) ||
    (raw.q !== undefined && raw.q !== query.query)
  )
    redirect(grammarLibraryHref(query));
  // 검색어/페이지 변경도 새 데이터가 준비될 때까지 해당 목록의 스켈레톤을 보여준다.
  return (
    <Suspense key={grammarLibraryHref(query)} fallback={<GrammarLibrarySkeleton />}>
      <GrammarLibraryContent query={query} />
    </Suspense>
  );
}
