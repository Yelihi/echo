import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import type { Database } from "@/shared/lib/supabase";
import { rejectDisabledTestAnalysisApi } from "@/shared/lib/test-analysis/guard";

type RoleplaySessionInsert = Database["public"]["Tables"]["roleplay_sessions"]["Insert"];
type RoleplaySessionLineInsert = Database["public"]["Tables"]["roleplay_session_lines"]["Insert"];

const DEFAULT_TEXT = "Hello, I am testing the analysis processor.";

export async function POST() {
  const disabled = rejectDisabledTestAnalysisApi();

  if (disabled) {
    return disabled;
  }

  const supabase = getSupabaseServiceRoleClient();
  const userId = await getFirstUserId();

  if (!userId) {
    return NextResponse.json({ error: "No auth user exists for test fixture." }, { status: 400 });
  }

  const session = await supabase
    .from("roleplay_sessions")
    .insert(createSessionRow(userId))
    .select("id,user_id")
    .single();

  if (session.error) {
    return NextResponse.json({ error: session.error.message }, { status: 500 });
  }

  const line = await supabase
    .from("roleplay_session_lines")
    .insert(createLineRow(session.data.user_id, session.data.id))
    .select("id,text_snapshot")
    .single();

  if (line.error) {
    return NextResponse.json({ error: line.error.message }, { status: 500 });
  }

  return NextResponse.json({
    practiceType: "roleplay",
    userId: session.data.user_id,
    sessionId: session.data.id,
    targetId: line.data.id,
    expectedText: line.data.text_snapshot,
  });
}

async function getFirstUserId(): Promise<string | null> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

  if (error) {
    throw error;
  }

  return data.users[0]?.id ?? null;
}

function createSessionRow(userId: string): RoleplaySessionInsert {
  return {
    user_id: userId,
    material_title_snapshot: "Issue 11 test material",
    situation_snapshot: "Issue 11 analysis processor integration test",
    speaker_one_name_snapshot: "Tutor",
    speaker_two_name_snapshot: "Learner",
    selected_learner_speaker_order: 2,
    status: "in_progress",
    started_at: new Date().toISOString(),
  };
}

function createLineRow(userId: string, sessionId: string): RoleplaySessionLineInsert {
  return {
    user_id: userId,
    session_id: sessionId,
    line_order: 0,
    speaker_order: 2,
    text_snapshot: DEFAULT_TEXT,
  };
}
