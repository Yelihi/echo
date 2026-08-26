// shared
import { buildTagFilterHref, parseTagQuery, toggleFilterTag } from "@/shared/utils/tagQuery";

// views
import { ROLE_PLAY_ALL_TAG } from "@/views/role-play/config/const";

const ROLE_PLAY_LIST_PATH = "/role-playing";

export function parseRolePlayTagQuery(tag: string | string[] | undefined): string[] {
  return parseTagQuery(tag);
}

export function getRolePlayListHref(tags: ReadonlyArray<string>) {
  return buildTagFilterHref(ROLE_PLAY_LIST_PATH, tags);
}

export function toggleRolePlayTag(tags: ReadonlyArray<string>, tag: string): string[] {
  return toggleFilterTag(tags, tag, ROLE_PLAY_ALL_TAG);
}
