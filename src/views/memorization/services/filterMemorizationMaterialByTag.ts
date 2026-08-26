// shared
import { buildTagFilterHref, parseTagQuery, toggleFilterTag } from "@/shared/utils/tagQuery";

// views
import { MEMORIZATION_ALL_TAG } from "@/views/memorization/config/const";

const MEMORIZATION_LIST_PATH = "/sentence-memorization";

export function parseMemorizationTagQuery(tag: string | string[] | undefined): string[] {
  return parseTagQuery(tag);
}

export function getMemorizationListHref(tags: ReadonlyArray<string>) {
  return buildTagFilterHref(MEMORIZATION_LIST_PATH, tags);
}

export function toggleMemorizationTag(tags: ReadonlyArray<string>, tag: string): string[] {
  return toggleFilterTag(tags, tag, MEMORIZATION_ALL_TAG);
}
