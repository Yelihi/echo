import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";

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
