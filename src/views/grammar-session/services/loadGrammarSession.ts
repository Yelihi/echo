import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";
import { GrammarSessionRepository } from "@/entities/grammar-session";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";

export async function loadGrammarSession(id: string) {
  if (!z.string().uuid().safeParse(id).success) notFound();
  const session = await observeOperation({
    operation: "grammar.session.read",
    resourceId: id,
    recordEvent: recordOperationEvent,
    execute: async () =>
      new GrammarSessionRepository(await createSupabaseServerClient()).findById(id),
  });
  if (!session) notFound();
  return session;
}
