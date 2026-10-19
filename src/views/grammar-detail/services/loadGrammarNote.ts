import "server-only";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { getPrivateGrammarCacheClient } from "@/shared/lib/query/grammarDetailCache";

export async function loadGrammarNote(id: string) {
  if (!z.string().uuid().safeParse(id).success) notFound();

  const note = await observeOperation({
    operation: "grammar.note.read",
    resourceId: id,
    recordEvent: recordOperationEvent,

    execute: async () => {
      const supabase = await createSupabaseServerClient();

      return new GrammarNoteRepository(supabase).findById(id);
    },
  });

  if (!note) notFound();

  return note;
}

export async function loadCachedGrammarDetailNote(id: string) {
  if (!z.string().uuid().safeParse(id).success) notFound();
  const access = await getPrivateGrammarCacheClient();
  if (!access) notFound();

  const read = unstable_cache(
    () => new GrammarNoteRepository(access.client).findById(id),
    ["grammar-detail-note", access.ownerId, id],
    { revalidate: 60 },
  );
  const note = await observeOperation({
    operation: "grammar.note.read",
    resourceId: id,
    recordEvent: recordOperationEvent,
    execute: read,
  });
  if (!note) notFound();
  return note;
}
