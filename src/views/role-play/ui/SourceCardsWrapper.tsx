"use client";

import { SourceCard } from "@/widgets/source-card";

import { mockSources } from "@/views/role-play/config/mock";
import { ROLE_PLAY_INNER_MENU_ITEMS } from "@/views/role-play/config/const";
import { RolePlayCardActionStrategyRegistry } from "@/views/role-play/services/RolePlayCardActionStrategy";
import type { SourceCardsWrapperProps } from "@/views/role-play/models/interface";

// service 내 strategyRepository 가져오기

// 추후 구현될(feature) menu 함수
const onNavigatePatch = () => {
  alert("수정하기");
};

const onDeleteSource = () => {
  alert("삭제하기");
};

// TODO: 서버 컴포넌트에서 필터/페이지네이션된 카드 목록을 props로 내려주게 되면 cards를 사용하도록 교체
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SourceCardsWrapper = ({ cards }: SourceCardsWrapperProps) => {
  const registry = new RolePlayCardActionStrategyRegistry({
    onNavigatePatch,
    onDelete: onDeleteSource,
  });

  const onMenuAction = () => (value: string, id: string) => {
    registry.execute(value, id);
  };

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[15px]">
      {mockSources.map((source) => (
        <SourceCard
          key={source.id}
          {...source}
          innerMenuItems={ROLE_PLAY_INNER_MENU_ITEMS}
          onMenuAction={onMenuAction()}
        />
      ))}
    </section>
  );
};
