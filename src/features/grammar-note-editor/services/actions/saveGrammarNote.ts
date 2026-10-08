"use server";

import { GrammarNotePersistenceError, GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { persistReviewedNote } from "../persistReviewedNote";
import type { SaveNoteCommand, SaveNoteResult } from "../../models/interface";

export async function saveGrammarNote(command: SaveNoteCommand): Promise<SaveNoteResult> {
  try {
    const note = await observeOperation({
      operation: "grammar.note.save",
      resourceId: "grammar-note",
      recordEvent: recordOperationEvent,

      execute: async () => {
        const client = await createSupabaseServerClient();
        const { data, error } = await client.auth.getUser();

        if (error || !data.user) throw new GrammarNotePersistenceError("UNAUTHORIZED");

        const repository = new GrammarNoteRepository(client);

        return persistReviewedNote(command, repository);
      },
    });

    return { ok: true, note };
  } catch (error) {
    const code = error instanceof GrammarNotePersistenceError ? error.code : "PERSISTENCE_FAILED";

    return { ok: false, code };
  }
}
