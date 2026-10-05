import { redirect } from "next/navigation";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import {
  GrammarLibraryView,
  parseGrammarLibraryQuery,
  grammarLibraryHref,
} from "@/views/grammar-library";
interface Props {
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}
export default async function GrammarLibraryPage({ searchParams }: Props) {
  const raw = await searchParams;
  const query = parseGrammarLibraryQuery(raw);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const data = await observeOperation({
    operation: "grammar.list",
    resourceId: "grammar-library",
    recordEvent: recordOperationEvent,
    execute: () => new GrammarNoteRepository(supabase).findMany({ ...query, pageSize: 20 }),
  });
  const normalizedPage = Math.min(query.page, Math.max(1, Math.ceil(data.total / data.pageSize)));
  // 범위를 벗어난 URL은 마지막 유효 페이지로 교정한다. 이후 링크와 상세 복귀도 같은 주소를 쓴다.
  if (
    normalizedPage !== query.page ||
    (raw.page !== undefined && raw.page !== String(query.page)) ||
    (raw.q !== undefined && raw.q !== query.query)
  )
    redirect(grammarLibraryHref({ ...query, page: normalizedPage }));
  return <GrammarLibraryView data={data} query={query.query} />;
}
