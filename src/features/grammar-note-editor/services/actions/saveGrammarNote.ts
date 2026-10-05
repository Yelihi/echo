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
    return {
      ok: false,
      message:
        code === "VERSION_CONFLICT"
          ? "다른 화면에서 노트가 변경되었습니다. 새로고침 후 다시 확인해 주세요."
          : code === "UNAUTHORIZED"
            ? "로그인 후 다시 저장해 주세요."
            : "노트를 저장하지 못했습니다. 잠시 후 다시 저장해 주세요.",
    };
  }
}
