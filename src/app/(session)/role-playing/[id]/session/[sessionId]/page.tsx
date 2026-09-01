import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { RoleplaySession } from "@/entities/roleplay-session";
import { SessionState } from "@/entities/roleplay-session";
import type { MaterialId, SessionId } from "@/entities/value-object";

// views
import type {
  RoleplayReadyEvaluationMode,
  RoleplayReadySettings,
} from "@/views/role-play/models/interface";
import { getRolePlayReadyMaterial } from "@/views/role-play/services/server/getRolePlayReadyMaterial";
import { getRolePlaySession } from "@/views/role-play/services/server/getRolePlaySession";
import { RolePlayRecordingView } from "@/views/recording/role-play/ui/RolePlayRecordingView";

interface RolePlayingSessionPageProps {
  params: Promise<{ id: string; sessionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const evaluationModes: RoleplayReadyEvaluationMode[] = ["exact", "context"];

export default async function RolePlayingSessionPage({
  params,
  searchParams,
}: RolePlayingSessionPageProps) {
  const [{ id, sessionId }, query] = await Promise.all([params, searchParams]);

  if (!isUuidString(id) || !isUuidString(sessionId)) {
    notFound();
  }

  const session = await getRolePlaySession(sessionId as SessionId);

  if (
    !session ||
    session.sourceMaterialId !== id ||
    session.state === SessionState.DELETED ||
    session.deletedAt
  ) {
    notFound();
  }

  const material = await getRolePlayReadyMaterial(id as MaterialId);

  if (!material) {
    notFound();
  }

  return (
    <RolePlayRecordingView
      material={material}
      settings={settingsFromSession(
        session,
        pick(query.evaluationMode, evaluationModes, "context"),
      )}
    />
  );
}

function settingsFromSession(
  session: RoleplaySession,
  evaluationMode: RoleplayReadyEvaluationMode,
): RoleplayReadySettings {
  return {
    role: session.selectedLearnerSpeakerOrder === 2 ? "learner" : "partner",
    evaluationMode,
    voice: session.partnerVoice,
    speed: session.speechSpeed,
  };
}

function pick<T extends string>(
  value: string | string[] | undefined,
  options: readonly T[],
  fallback: T,
) {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected && options.includes(selected as T) ? (selected as T) : fallback;
}
