import { redirect } from "next/navigation";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { GrammarLibraryQuery } from "../models/interface";
import { grammarLibraryHref } from "../services/libraryQuery";
import { GrammarLibraryView } from "./GrammarLibraryView";
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
    execute: () => new GrammarNoteRepository(supabase).findMany({ ...query, pageSize: 20 }),
  });
  const page = Math.min(query.page, Math.max(1, Math.ceil(data.total / data.pageSize)));
  if (page !== query.page) redirect(grammarLibraryHref({ ...query, page }));
  return <GrammarLibraryView data={data} query={query.query} />;
}
