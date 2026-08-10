import { notFound } from "next/navigation";

import { getMemorizationReadyMockMaterial } from "@/views/memorization/config/readyMock";
import type {
  MemorizationReadyMode,
  MemorizationReadySettings,
} from "@/views/memorization/models/ready";
import { MemorizationRecordingView } from "@/views/recording/memorization/ui/MemorizationRecordingView";

interface SentenceMemorizationSessionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const modes: MemorizationReadyMode[] = ["read", "translate", "title"];

export default async function SentenceMemorizationSessionPage({
  params,
  searchParams,
}: SentenceMemorizationSessionPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const material = getMemorizationReadyMockMaterial(id);

  if (!material) {
    notFound();
  }

  return <MemorizationRecordingView material={material} settings={parseSettings(query)} />;
}

function parseSettings(
  query: Record<string, string | string[] | undefined>,
): MemorizationReadySettings {
  const mode = first(query.mode);

  return {
    mode:
      mode && modes.includes(mode as MemorizationReadyMode)
        ? (mode as MemorizationReadyMode)
        : "read",
  };
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
