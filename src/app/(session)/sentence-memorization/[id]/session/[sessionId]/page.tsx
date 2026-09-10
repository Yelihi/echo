import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import { SessionState } from "@/entities/memorization-session";
import type { SessionId } from "@/entities/value-object";

// views
import type { MemorizationReadyMode } from "@/features/memorization-sessions/models/ready";
import { convertMemorizationSessionToRecordingMaterial } from "@/views/memorization/models/converter/convertMemorizationSessionToRecordingMaterial";
import { getMemorizationSession } from "@/views/memorization/services/server/getMemorizationSession";
import { MemorizationRecordingView } from "@/views/recording/ui/memorization/MemorizationRecordingView";

interface SentenceMemorizationSessionPageProps {
  params: Promise<{ id: string; sessionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const modes: MemorizationReadyMode[] = ["read", "translate", "title"];

export default async function SentenceMemorizationSessionPage({
  params,
  searchParams,
}: SentenceMemorizationSessionPageProps) {
  const [{ id, sessionId }, query] = await Promise.all([params, searchParams]);

  if (!isUuidString(id) || !isUuidString(sessionId)) {
    notFound();
  }

  const session = await getMemorizationSession(sessionId as SessionId);

  if (
    !session ||
    session.state === SessionState.DELETED ||
    session.deletedAt ||
    (session.sourceMaterialId !== null && session.sourceMaterialId !== id)
  ) {
    notFound();
  }

  return (
    <MemorizationRecordingView
      material={convertMemorizationSessionToRecordingMaterial(session, id)}
      settings={{
        mode: pick(query.mode, modes, "read"),
      }}
    />
  );
}

function pick<T extends string>(
  value: string | string[] | undefined,
  options: readonly T[],
  fallback: T,
) {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected && options.includes(selected as T) ? (selected as T) : fallback;
}
