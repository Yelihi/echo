// views
import { ROLE_PLAY_ALL_TAG } from "@/views/role-play/config/const";

export function parseRolePlayTagQuery(tag: string | string[] | undefined): string[] {
  const raw = tag == null ? [] : Array.isArray(tag) ? tag : [tag];

  return [
    ...new Set(
      raw.map((item) => item.trim().toLocaleLowerCase()).filter((item) => item.length > 0),
    ),
  ];
}

export function getRolePlayListHref(tags: ReadonlyArray<string>) {
  const params = new URLSearchParams();

  tags.forEach((tag) => {
    params.append("tag", tag);
  });

  const query = params.toString();
  return query ? `/role-playing?${query}` : "/role-playing";
}

export function toggleRolePlayTag(tags: ReadonlyArray<string>, tag: string): string[] {
  const normalized = tag.trim().toLocaleLowerCase();

  if (normalized === ROLE_PLAY_ALL_TAG.toLocaleLowerCase()) {
    return [];
  }

  return tags.includes(normalized)
    ? tags.filter((item) => item !== normalized)
    : [...tags, normalized];
}
