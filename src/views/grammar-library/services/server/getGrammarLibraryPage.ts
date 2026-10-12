import "server-only";

import { GrammarNoteRepository } from "@/entities/grammar-note";
import { requireUserOrRedirect } from "@/features/login/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { GrammarLibraryQuery } from "../../models/interface";

export async function getGrammarLibraryPage(query: GrammarLibraryQuery) {
  const supabase = await createSupabaseServerClient();
  await requireUserOrRedirect(supabase);

  return observeOperation({
    operation: "grammar.list",
    resourceId: "grammar-library",
    recordEvent: recordOperationEvent,
    execute: () => new GrammarNoteRepository(supabase).findMany({ ...query, pageSize: 10 }),
  }).catch(() => null);
}
