import { Plus } from "lucide-react";

import { Button, TagChip } from "@/shared/components";
import { mockSources } from "@/views/role-play/config/mock";
import { SourceCardsWrapper } from "@/views/role-play/ui/SourceCardsWrapper";

const ROLE_PLAY_TAGS = ["전체", "일상", "여행", "비즈니스", "초급"];

export function RolePlayView() {
  return (
    <section className="flex w-full flex-col gap-7" data-pillar="roleplay">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-md font-bold text-black-primary">롤플레잉</h1>
          <p className="text-body-4 text-gray-text">연습할 2인 대화 자료를 선택하세요.</p>
        </div>
        <Button size="lg">
          <Plus className="size-4" />새 자료
        </Button>
      </header>

      <nav aria-label="롤플레잉 태그 필터" className="flex w-full gap-2 overflow-x-auto">
        {ROLE_PLAY_TAGS.map((tag, index) => (
          <TagChip key={tag} selected={index === 0}>
            {tag}
          </TagChip>
        ))}
      </nav>

      <SourceCardsWrapper cards={mockSources} />
    </section>
  );
}
