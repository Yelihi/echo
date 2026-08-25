"use client";

import { useRouter } from "next/navigation";

// widgets
import { SourceCard, SourceCardSkeleton } from "@/widgets/source-card";

// views
import {
  ROLE_PLAY_INNER_MENU_ITEMS,
  ROLE_PLAY_LIST_PAGE_SIZE,
  ROLE_PLAY_SOURCE_CARDS_GRID_CLASSNAME,
} from "@/views/role-play/config/const";
import type { SourceCardsWrapperProps } from "@/views/role-play/models/interface";
import { RolePlayCardActionStrategyRegistry } from "@/views/role-play/services/RolePlayCardActionStrategy";

const onDeleteSource = () => {
  alert("삭제하기");
};

export const SourceCardsWrapper = ({ cards }: SourceCardsWrapperProps) => {
  const router = useRouter();

  const registry = new RolePlayCardActionStrategyRegistry({
    onNavigatePatch: (id) => router.push(`/role-playing/${id}/edit`),
    onDelete: onDeleteSource,
  });

  const onMenuAction = (value: string, id: string) => {
    registry.execute(value, id);
  };

  return (
    <section className={ROLE_PLAY_SOURCE_CARDS_GRID_CLASSNAME}>
      {cards.map((source) => (
        <SourceCard
          key={source.id}
          {...source}
          href={`/role-playing/${source.id}/ready`}
          innerMenuItems={ROLE_PLAY_INNER_MENU_ITEMS}
          onMenuAction={onMenuAction}
        />
      ))}
    </section>
  );
};

export function SourceCardsWrapperSkeleton() {
  return (
    <section className={ROLE_PLAY_SOURCE_CARDS_GRID_CLASSNAME} aria-hidden>
      {Array.from({ length: ROLE_PLAY_LIST_PAGE_SIZE }, (_, index) => (
        <SourceCardSkeleton key={index} />
      ))}
    </section>
  );
}
