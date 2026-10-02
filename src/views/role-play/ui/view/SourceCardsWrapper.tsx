"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { errorPopupManager } from "@/shared/lib/error-popup";
import { deleteRolePlayMaterial } from "../../services/action/deleteRolePlayMaterial";
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

export const SourceCardsWrapper = ({ cards }: SourceCardsWrapperProps) => {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const confirmDelete = () => {
    if (!deleteId || isDeleting) return;
    const id = deleteId;
    startDelete(async () => {
      try {
        if (!(await deleteRolePlayMaterial(id))) throw new Error("Delete failed");
        router.refresh();
      } catch {
        errorPopupManager.open({
          title: "삭제하지 못했습니다",
          message: "자료는 목록에 남아 있습니다. 잠시 후 다시 시도해주세요.",
        });
      }
    });
  };

  const registry = new RolePlayCardActionStrategyRegistry({
    onNavigatePatch: (id) => router.push(`/role-playing/${id}/edit`),
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
        className={ROLE_PLAY_SOURCE_CARDS_GRID_CLASSNAME}
      >
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
    </>
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
