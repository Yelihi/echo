import { MemorizationReadyView } from "@/views/memorization";

interface SentenceMemorizationReadyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SentenceMemorizationReadyPage({
  params,
}: SentenceMemorizationReadyPageProps) {
  const { id } = await params;

  return <MemorizationReadyView materialId={id} />;
}
