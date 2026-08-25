// shared
import { Pagination } from "@/shared/components/ui";

// views
import type { RolePlayViewProps } from "@/views/role-play/models/interface";
import { mappingRolePlayMetarialCard } from "@/views/role-play/services/server/mappingRolePlayMetarialCard";
import { RolePlayEmptySourceCards } from "@/views/role-play/ui/view/RolePlayEmptySourceCards";
import { SourceCardsWrapper } from "@/views/role-play/ui/view/SourceCardsWrapper";

export async function RolePlaySourceCardList({ page, tags }: RolePlayViewProps) {
  const { cards, totalPages } = await mappingRolePlayMetarialCard({ page, tags });

  if (cards.length === 0 && totalPages === 0) {
    return <RolePlayEmptySourceCards />;
  }

  return (
    <div className="flex flex-col gap-7">
      {cards.length === 0 ? <RolePlayEmptySourceCards /> : <SourceCardsWrapper cards={cards} />}
      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
