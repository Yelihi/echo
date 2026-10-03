import { Suspense } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

// shared
import { Button } from "@/shared/components";
import { PaginationSkeleton } from "@/shared/components/ui";

// views
import type { MemorizationViewProps } from "@/views/memorization/models/interface";
import { MemorizationSourceCardList } from "@/views/memorization/ui/view/MemorizationSourceCardList";
import {
  MemorizationTagFilter,
  MemorizationTagFilterSkeleton,
} from "@/views/memorization/ui/view/MemorizationTagFilter";
import { SourceCardsWrapperSkeleton } from "@/views/memorization/ui/view/SourceCardsWrapper";

function MemorizationViewHeader() {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4">
        <h1 className="text-display break-keep text-black-primary">문장 암기</h1>
        <p className="text-body-4 text-gray-text">외울 문장 묶음을 선택하고 연습을 시작하세요.</p>
      </div>
      <Button size="lg" asChild>
        <Link href="/sentence-memorization/new">
          <Plus className="size-4" />새 자료
        </Link>
      </Button>
    </header>
  );
}

export function MemorizationViewFallback() {
  return (
    <section className="flex w-full flex-1 flex-col gap-7" data-pillar="memo">
      <MemorizationViewHeader />
      <MemorizationTagFilterSkeleton />
      <div className="flex flex-col gap-7">
        <SourceCardsWrapperSkeleton />
        <PaginationSkeleton />
      </div>
    </section>
  );
}

export function MemorizationView({ page, tags }: MemorizationViewProps) {
  return (
    <section className="flex w-full flex-1 flex-col gap-7" data-pillar="memo">
      <MemorizationViewHeader />

      <Suspense fallback={<MemorizationTagFilterSkeleton />}>
        <MemorizationTagFilter selectedTags={tags} />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex flex-col gap-7">
            <SourceCardsWrapperSkeleton />
            <PaginationSkeleton />
          </div>
        }
      >
        <MemorizationSourceCardList page={page} tags={tags} />
      </Suspense>
    </section>
  );
}
