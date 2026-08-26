"use client";

import { useRouter } from "next/navigation";

// widgets
import { SourceCard, SourceCardSkeleton } from "@/widgets/source-card";

// views
import {
  MEMORIZATION_INNER_MENU_ITEMS,
  MEMORIZATION_LIST_PAGE_SIZE,
  MEMORIZATION_SOURCE_CARDS_GRID_CLASSNAME,
} from "@/views/memorization/config/const";
import type { SourceCardsWrapperProps } from "@/views/memorization/models/interface";
import { MemorizationCardActionStrategyRegistry } from "@/views/memorization/services/MemorizationCardActionStrategy";

const onDeleteSource = () => {
  alert("삭제하기");
};

export const SourceCardsWrapper = ({ cards }: SourceCardsWrapperProps) => {
  const router = useRouter();

  const registry = new MemorizationCardActionStrategyRegistry({
    onNavigatePatch: (id) => router.push(`/sentence-memorization/${id}/edit`),
    onDelete: onDeleteSource,
  });

  const onMenuAction = (value: string, id: string) => {
    registry.execute(value, id);
  };

  return (
    <section className={MEMORIZATION_SOURCE_CARDS_GRID_CLASSNAME}>
      {cards.map((source) => (
        <SourceCard
          key={source.id}
          {...source}
          href={`/sentence-memorization/${source.id}/ready`}
          innerMenuItems={MEMORIZATION_INNER_MENU_ITEMS}
          onMenuAction={onMenuAction}
        />
      ))}
    </section>
  );
};

export function SourceCardsWrapperSkeleton() {
  return (
    <section className={MEMORIZATION_SOURCE_CARDS_GRID_CLASSNAME} aria-hidden>
      {Array.from({ length: MEMORIZATION_LIST_PAGE_SIZE }, (_, index) => (
        <SourceCardSkeleton key={index} />
      ))}
    </section>
  );
}
