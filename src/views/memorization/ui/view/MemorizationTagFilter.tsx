import Link from "next/link";

// shared
import { TagChip, TagChipSkeleton } from "@/shared/components";

// entities
import type { TagValue } from "@/entities/value-object";

// views
import { MEMORIZATION_ALL_TAG } from "@/views/memorization/config/const";
import {
  getMemorizationListHref,
  toggleMemorizationTag,
} from "@/views/memorization/services/filterMemorizationMaterialByTag";
import { getMemorizationMaterialFilterTags } from "@/views/memorization/services/server/getMemorizationMaterialFilterTags";

export const MEMORIZATION_TAG_FILTER_SKELETON_COUNT = 5;

const TAG_FILTER_SKELETON_WIDTHS = ["w-12", "w-16", "w-20", "w-14", "w-[72px]"] as const;

interface MemorizationTagFilterListProps {
  selectedTags: string[];
  filterTags: ReadonlyArray<TagValue>;
}

export async function MemorizationTagFilter({ selectedTags }: { selectedTags: string[] }) {
  const filterTags = await getMemorizationMaterialFilterTags();

  return <MemorizationTagFilterList selectedTags={selectedTags} filterTags={filterTags} />;
}

export function MemorizationTagFilterList({
  selectedTags,
  filterTags,
}: MemorizationTagFilterListProps) {
  return (
    <nav aria-label="문장 암기 태그 필터" className="flex w-full gap-2 overflow-x-auto">
      <TagChip asChild selected={selectedTags.length === 0}>
        <Link href="/sentence-memorization">{MEMORIZATION_ALL_TAG}</Link>
      </TagChip>
      {filterTags.map((tag) => {
        const selected = selectedTags.includes(tag.normalizedName);

        return (
          <TagChip asChild key={tag.normalizedName} selected={selected}>
            <Link
              href={getMemorizationListHref(
                toggleMemorizationTag(selectedTags, tag.normalizedName),
              )}
            >
              {tag.displayName}
            </Link>
          </TagChip>
        );
      })}
    </nav>
  );
}

export function MemorizationTagFilterSkeleton() {
  return (
    <nav className="flex w-full gap-2 overflow-x-auto" aria-hidden>
      {Array.from({ length: MEMORIZATION_TAG_FILTER_SKELETON_COUNT }, (_, index) => (
        <TagChipSkeleton key={index} className={TAG_FILTER_SKELETON_WIDTHS[index]} />
      ))}
    </nav>
  );
}
