import { notFound } from "next/navigation";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import type { MaterialId } from "@/entities/value-object";

// views
import type {
  RoleplayReadyEvaluationMode,
  RoleplayReadyRole,
  RoleplayReadySettings,
  RoleplayReadyVoice,
} from "@/views/role-play/models/interface";
import { getRolePlayReadyMaterial } from "@/views/role-play/services/server/getRolePlayReadyMaterial";
import { RolePlayRecordingView } from "@/views/recording/role-play/ui/RolePlayRecordingView";

interface RolePlayingSessionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const roles: RoleplayReadyRole[] = ["learner", "partner"];
const evaluationModes: RoleplayReadyEvaluationMode[] = ["exact", "context"];
const voices: RoleplayReadyVoice[] = ["soft", "bright", "calm"];

export default async function RolePlayingSessionPage({
  params,
  searchParams,
}: RolePlayingSessionPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  if (!isUuidString(id)) {
    notFound();
  }

  const material = await getRolePlayReadyMaterial(id as MaterialId);

  if (!material) {
    notFound();
  }

  return <RolePlayRecordingView material={material} settings={parseSettings(query)} />;
}

function parseSettings(
  query: Record<string, string | string[] | undefined>,
): RoleplayReadySettings {
  const role = pick(query.role, roles, "learner");
  const evaluationMode = pick(query.evaluationMode, evaluationModes, "context");
  const voice = pick(query.voice, voices, "soft");
  const speed = Number(first(query.speed));

  return {
    role,
    evaluationMode,
    voice,
    speed: Number.isFinite(speed) ? speed : 1,
  };
}

function pick<T extends string>(
  value: string | string[] | undefined,
  options: readonly T[],
  fallback: T,
) {
  const selected = first(value);
  return selected && options.includes(selected as T) ? (selected as T) : fallback;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
