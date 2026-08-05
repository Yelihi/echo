"use client";

import { useRouter } from "next/navigation";

import { SourceCard } from "@/widgets/source-card";

import { MEMORIZATION_INNER_MENU_ITEMS } from "@/views/memorization/config/const";
import { MemorizationCardActionStrategyRegistry } from "@/views/memorization/services/MemorizationCardActionStrategy";
import type { MemorizationCardsWrapperProps } from "@/views/memorization/models/interface";

const onDeleteSource = () => {
  alert("삭제하기");
};

export function MemorizationCardsWrapper({ cards }: MemorizationCardsWrapperProps) {
  const router = useRouter();

  const registry = new MemorizationCardActionStrategyRegistry({
    onNavigatePatch: (id) => router.push(`/sentence-memorization/${id}/edit`),
    onDelete: onDeleteSource,
  });

  const onMenuAction = (value: string, id: string) => {
    registry.execute(value, id);
  };

  return (
    <section className="grid w-full grid-cols-1 gap-[15px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
}
