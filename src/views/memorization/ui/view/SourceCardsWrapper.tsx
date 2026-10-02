"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { errorPopupManager } from "@/shared/lib/error-popup";
import { deleteMemorizationMaterial } from "../../services/action/deleteMemorizationMaterial";
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

export const SourceCardsWrapper = ({ cards }: SourceCardsWrapperProps) => {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const confirmDelete = () => {
    if (!deleteId || isDeleting) return;
    const id = deleteId;
    startDelete(async () => {
      try {
        if (!(await deleteMemorizationMaterial(id))) throw new Error("Delete failed");
        router.refresh();
      } catch {
        errorPopupManager.open({
          title: "삭제하지 못했습니다",
          message: "자료는 목록에 남아 있습니다. 잠시 후 다시 시도해주세요.",
        });
      }
    });
  };

  const registry = new MemorizationCardActionStrategyRegistry({
    onNavigatePatch: (id) => router.push(`/sentence-memorization/${id}/edit`),
    onDelete: setDeleteId,
  });

  const onMenuAction = (value: string, id: string) => {
    registry.execute(value, id);
  };

  return (
    <>
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        tone="danger"
        title="자료를 삭제할까요?"
        description="자료 목록에서 제거됩니다. 기존 학습 기록과 녹음은 유지됩니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={confirmDelete}
      />
      <section
        aria-busy={isDeleting}
        inert={isDeleting}
        className={MEMORIZATION_SOURCE_CARDS_GRID_CLASSNAME}
      >
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
    </>
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
