import { redirect } from "next/navigation";
import type { GrammarLibraryQuery } from "../models/interface";
import { grammarLibraryHref } from "../services/libraryQuery";
import { getGrammarLibraryPage } from "../services/server/getGrammarLibraryPage";
import { GrammarNoteList } from "./GrammarNoteList";

export async function GrammarLibraryContent({ query }: { query: GrammarLibraryQuery }) {
  const notePage = await getGrammarLibraryPage(query);

  if (!notePage) {
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
  const page = Math.min(query.page, Math.max(1, Math.ceil(notePage.total / notePage.pageSize)));

  if (page !== query.page) redirect(grammarLibraryHref({ ...query, page }));

  return <GrammarNoteList data={notePage} query={query.query} />;
}
