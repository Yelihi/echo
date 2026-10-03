import { MaterialLibraryHeader } from "@/widgets/material-library/ui/MaterialLibraryHeader";
import { Suspense } from "react";

// shared
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
  return <MaterialLibraryHeader type="memorization" />;
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
