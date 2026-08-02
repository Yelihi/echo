import { Plus } from "lucide-react";

import { Button, TagChip } from "@/shared/components";
import { mockMemorizationSources } from "@/views/memorization/config/mock";
import { MemorizationCardsWrapper } from "@/views/memorization/ui/MemorizationCardsWrapper";

const MEMORIZATION_TAGS = ["전체", "스피치", "TED", "면접", "중급"];

export function MemorizationView() {
  return (
    <section className="flex w-full flex-col gap-7" data-pillar="memo">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-md font-bold text-black-primary">문장 암기</h1>
          <p className="text-body-4 text-gray-text">외울 문장 묶음을 선택하고 연습을 시작하세요.</p>
        </div>
        <Button size="lg">
          <Plus className="size-4" />새 자료
        </Button>
      </header>

      <nav aria-label="문장 암기 태그 필터" className="flex w-full gap-2 overflow-x-auto">
        {MEMORIZATION_TAGS.map((tag, index) => (
          <TagChip key={tag} selected={index === 0}>
            {tag}
          </TagChip>
        ))}
      </nav>

      <MemorizationCardsWrapper cards={mockMemorizationSources} />
    </section>
  );
}
