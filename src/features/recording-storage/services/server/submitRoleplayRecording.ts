import "server-only";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { roleplayRecordingRequestSchema } from "../../models/roleplayRecording";
import { saveLearnerRecording } from "./saveLearnerRecording";
import { completeRoleplayRecording } from "./completeRoleplayRecording";

export async function submitRoleplayRecording(request: Request): Promise<Response> {
  const authClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  const form = await request.formData();
  const parsed = roleplayRecordingRequestSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { sessionId, action } = parsed.data;
  const { data: session } = await authClient
    .from("roleplay_sessions")
    .select("id,status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!session || session.status === "deleted")
    return Response.json({ error: "Session unavailable" }, { status: 404 });
  const supabase = getSupabaseServiceRoleClient();
  if (action === "finish") return completeRoleplayRecording(supabase, user.id, sessionId);
  return saveLearnerRecording(form, {
    authClient,
    supabase,
    userId: user.id,
    sessionId,
    sessionStatus: session.status,
  });
}
