import Link from "next/link";

// shared
import { TagChip, TagChipSkeleton } from "@/shared/components";

// entities
import type { TagValue } from "@/entities/value-object";

// views
import { ROLE_PLAY_ALL_TAG } from "@/views/role-play/config/const";
import {
  getRolePlayListHref,
  toggleRolePlayTag,
} from "@/views/role-play/services/filterRolePlayMaterialByTag";
import { getRolePlayMaterialFilterTags } from "@/views/role-play/services/server/getRolePlayMaterialFilterTags";

export const ROLE_PLAY_TAG_FILTER_SKELETON_COUNT = 5;

const TAG_FILTER_SKELETON_WIDTHS = ["w-12", "w-16", "w-20", "w-14", "w-[72px]"] as const;

interface RolePlayTagFilterListProps {
  selectedTags: string[];
  filterTags: ReadonlyArray<TagValue>;
}

export async function RolePlayTagFilter({ selectedTags }: { selectedTags: string[] }) {
  const filterTags = await getRolePlayMaterialFilterTags();

  return <RolePlayTagFilterList selectedTags={selectedTags} filterTags={filterTags} />;
}

export function RolePlayTagFilterList({ selectedTags, filterTags }: RolePlayTagFilterListProps) {
  return (
    <nav aria-label="롤플레잉 태그 필터" className="flex w-full gap-2 overflow-x-auto">
      <TagChip asChild selected={selectedTags.length === 0}>
        <Link href="/role-playing">{ROLE_PLAY_ALL_TAG}</Link>
      </TagChip>
      {filterTags.map((tag) => {
        const selected = selectedTags.includes(tag.normalizedName);

        return (
          <TagChip asChild key={tag.normalizedName} selected={selected}>
            <Link href={getRolePlayListHref(toggleRolePlayTag(selectedTags, tag.normalizedName))}>
              {tag.displayName}
            </Link>
          </TagChip>
        );
      })}
    </nav>
  );
}

export function RolePlayTagFilterSkeleton() {
  return (
    <nav className="flex w-full gap-2 overflow-x-auto" aria-hidden>
      {Array.from({ length: ROLE_PLAY_TAG_FILTER_SKELETON_COUNT }, (_, index) => (
        <TagChipSkeleton key={index} className={TAG_FILTER_SKELETON_WIDTHS[index]} />
      ))}
    </nav>
  );
}
