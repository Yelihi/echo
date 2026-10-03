import { MaterialLibraryHeader } from "@/widgets/material-library/ui/MaterialLibraryHeader";
import { Suspense } from "react";

// shared
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
  return <MaterialLibraryHeader type="roleplay" />;
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
