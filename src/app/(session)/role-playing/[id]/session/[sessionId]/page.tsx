import { notFound, redirect } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { RoleplaySession } from "@/entities/roleplay-session";
import { SessionState } from "@/entities/roleplay-session";
import type { SessionId } from "@/entities/value-object";

// views
import type { RoleplayReadySettings } from "@/views/role-play/models/interface";
import { convertRolePlaySessionToRecordingMaterial } from "@/views/role-play/models/converter/convertRolePlaySessionToRecordingMaterial";
import { getRolePlaySession } from "@/features/roleplay-sessions/services/server/getRolePlaySession";
import { RolePlayRecordingView } from "@/views/recording/ui/role-play/RolePlayRecordingView";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

interface RolePlayingSessionPageProps {
  params: Promise<{ id: string; sessionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RolePlayingSessionPage({ params }: RolePlayingSessionPageProps) {
  const { id, sessionId } = await params;

  if (!isUuidString(id) || !isUuidString(sessionId)) {
    notFound();
  }

  const session = await getRolePlaySession(sessionId as SessionId);

  if (
    !session ||
    session.state === SessionState.DELETED ||
    session.deletedAt ||
    (session.sourceMaterialId !== null && session.sourceMaterialId !== id)
  ) {
    notFound();
  }

  if (session.state === SessionState.COMPLETED) redirect(`/roleplay-sessions/${session.id}/result`);
  const material = convertRolePlaySessionToRecordingMaterial(session, id);
  const supabase = await createSupabaseServerClient();
  const { data: accepted, error } = await supabase
    .from("accepted_recordings")
    .select("roleplay_line_id")
    .eq("roleplay_session_id", session.id);
  if (error) throw error;
  const savedIds = new Set(accepted.map((recording) => recording.roleplay_line_id));
  const turns = material.recordingTurns ?? [];
  const pending = turns.findIndex((turn) => !savedIds.has(turn.learnerLineId));
  const closing = pending === -1 && Boolean(turns.at(-1)?.closingPartnerLine);

  return (
    <RolePlayRecordingView
      sessionId={session.id}
      material={material}
      resume={
        savedIds.size
          ? {
              step: pending === -1 ? turns.length : pending + 1,
              closingPartner: closing,
              phase:
                pending === -1
                  ? closing
                    ? "partner-speaking"
                    : "completed"
                  : turns[pending].partnerLine
                    ? "partner-speaking"
                    : "user-ready",
            }
          : undefined
      }
      settings={settingsFromSession(session)}
    />
  );
}

function settingsFromSession(session: RoleplaySession): RoleplayReadySettings {
  return {
    role: session.selectedLearnerSpeakerOrder === 2 ? "learner" : "partner",
    evaluationMode: session.evaluationMode,
    voice: session.partnerVoice,
    speed: session.speechSpeed,
  };
}
