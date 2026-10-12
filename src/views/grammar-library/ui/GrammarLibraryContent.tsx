import { redirect } from "next/navigation";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { GrammarLibraryQuery } from "../models/interface";
import { grammarLibraryHref } from "../services/libraryQuery";
import { GrammarNoteList } from "./GrammarNoteList";

export async function GrammarLibraryContent({ query }: { query: GrammarLibraryQuery }) {
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
    execute: () => new GrammarNoteRepository(supabase).findMany({ ...query, pageSize: 10 }),
  }).catch(() => null);

  if (!data) {
    return (
      <section aria-label="어법 노트 목록" className="mx-auto max-w-4xl space-y-4">
        <p role="alert" className="text-practice-secondary">
          어법 노트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <a href={grammarLibraryHref(query)} className="text-practice-accent underline">
          다시 불러오기
        </a>
      </section>
    );
  }
  const page = Math.min(query.page, Math.max(1, Math.ceil(data.total / data.pageSize)));

  if (page !== query.page) redirect(grammarLibraryHref({ ...query, page }));

  return <GrammarNoteList data={data} query={query.query} />;
}
