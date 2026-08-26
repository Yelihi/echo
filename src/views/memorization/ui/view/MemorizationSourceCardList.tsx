// shared
import { Pagination } from "@/shared/components/ui";

// views
import type { MemorizationViewProps } from "@/views/memorization/models/interface";
import { mappingMemorizationMaterialCard } from "@/views/memorization/services/server/mappingMemorizationMaterialCard";
import { MemorizationEmptySourceCards } from "@/views/memorization/ui/view/MemorizationEmptySourceCards";
import { SourceCardsWrapper } from "@/views/memorization/ui/view/SourceCardsWrapper";

export async function MemorizationSourceCardList({ page, tags }: MemorizationViewProps) {
  const { cards, totalPages } = await mappingMemorizationMaterialCard({ page, tags });

  if (cards.length === 0 && totalPages === 0) {
    return <MemorizationEmptySourceCards />;
  }

  return (
    <div className="flex flex-col gap-7">
      {cards.length === 0 ? <MemorizationEmptySourceCards /> : <SourceCardsWrapper cards={cards} />}
      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
