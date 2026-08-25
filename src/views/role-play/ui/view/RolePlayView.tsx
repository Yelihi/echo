import { Suspense } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

// shared
import { Button } from "@/shared/components";
import { PaginationSkeleton } from "@/shared/components/ui";

// views
import type { RolePlayViewProps } from "@/views/role-play/models/interface";
import { RolePlaySourceCardList } from "@/views/role-play/ui/view/RolePlaySourceCardList";
import {
  RolePlayTagFilter,
  RolePlayTagFilterSkeleton,
} from "@/views/role-play/ui/view/RolePlayTagFilter";
import { SourceCardsWrapperSkeleton } from "@/views/role-play/ui/view/SourceCardsWrapper";

function RolePlayViewHeader() {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-heading-md font-bold text-black-primary">롤플레잉</h1>
        <p className="text-body-4 text-gray-text">연습할 2인 대화 자료를 선택하세요.</p>
      </div>
      <Button size="lg" asChild>
        <Link href="/role-playing/new">
          <Plus className="size-4" />새 자료
        </Link>
      </Button>
    </header>
  );
}

export function RolePlayViewFallback() {
  return (
    <section className="flex w-full flex-1 flex-col gap-7" data-pillar="roleplay">
      <RolePlayViewHeader />
      <RolePlayTagFilterSkeleton />
      <div className="flex flex-col gap-7">
        <SourceCardsWrapperSkeleton />
        <PaginationSkeleton />
      </div>
    </section>
  );
}

export function RolePlayView({ page, tags }: RolePlayViewProps) {
  return (
    <section className="flex w-full flex-1 flex-col gap-7" data-pillar="roleplay">
      <RolePlayViewHeader />

      <Suspense fallback={<RolePlayTagFilterSkeleton />}>
        <RolePlayTagFilter selectedTags={tags} />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex flex-col gap-7">
            <SourceCardsWrapperSkeleton />
            <PaginationSkeleton />
          </div>
        }
      >
        <RolePlaySourceCardList page={page} tags={tags} />
      </Suspense>
    </section>
  );
}
