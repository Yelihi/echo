"use server";

import { UserProfileRepository } from "@/entities/user-profile";
import { grammarDifficultySchema } from "@/entities/user-profile/models/entity";
import type { UserId } from "@/entities/value-object";
import { getAuthenticatedUser } from "@/shared/lib/supabase/getAuthenticatedUser";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { SaveGrammarDifficultyResult } from "../../models/interface";

export async function saveGrammarDifficulty(input: unknown): Promise<SaveGrammarDifficultyResult> {
  const parsed = grammarDifficultySchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID" };

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return { ok: false, code: "UNAUTHORIZED" };

    await new UserProfileRepository(supabase).saveDifficulty(user.id as UserId, parsed.data);
    return { ok: true };
  } catch (error) {
    console.error("예문 난이도 저장 실패", error);
    return { ok: false, code: "FAILED" };
  }
}
