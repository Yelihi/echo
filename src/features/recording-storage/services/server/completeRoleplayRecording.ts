import "server-only";
import type { RoleplayRecordingContext } from "../../models/roleplayRecording";
import { recordingRpcFailureResponse } from "./recordingRpcFailure";

export async function completeRoleplayRecording(
  supabase: RoleplayRecordingContext["supabase"],
  userId: string,
  sessionId: string,
): Promise<Response> {
  const { error } = await supabase.rpc("finish_roleplay_recording", {
    p_user_id: userId,
    p_session_id: sessionId,
  });
  return error ? recordingRpcFailureResponse(error) : Response.json({ completed: true });
}
