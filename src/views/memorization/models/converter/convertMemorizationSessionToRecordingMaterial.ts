// entities
import type { MemorizationSession } from "@/entities/memorization-session";

// views
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";

export function convertMemorizationSessionToRecordingMaterial(
  session: MemorizationSession,
  routeMaterialId: string,
): MemorizationReadyMaterial {
  const sentences = session.paragraphSnapshots.flatMap((paragraph) => paragraph.sentences);
  const wordCount = countWords(sentences.map((sentence) => sentence.text).join(" "));

  return {
    id: routeMaterialId,
    tags: session.tagsSnapshot.map((tag) => tag.displayName),
    title: session.materialTitleSnapshot,
    description: session.paragraphSnapshots[0]?.sentences[0]?.text ?? "",
    paragraphCount: session.paragraphSnapshots.length,
    wordCount,
    estimatedMinutes: Math.max(1, Math.ceil(Math.max(sentences.length, 1) / 3)),
    difficulty: session.tagsSnapshot.at(-1)?.displayName ?? "기본",
  };
}

function countWords(text: string): number {
  const normalized = text.trim();

  if (normalized.length === 0) {
    return 0;
  }

  return normalized.split(/\s+/).length;
}
