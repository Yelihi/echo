const TAG_QUERY_KEY = "tag";

export function parseTagQuery(tag: string | string[] | undefined): string[] {
  const raw = tag == null ? [] : Array.isArray(tag) ? tag : [tag];

  return [
    ...new Set(
      raw.map((item) => item.trim().toLocaleLowerCase()).filter((item) => item.length > 0),
    ),
  ];
}

export function buildTagFilterHref(pathname: string, tags: ReadonlyArray<string>): string {
  const params = new URLSearchParams();

  tags.forEach((tag) => {
    params.append(TAG_QUERY_KEY, tag);
  });

  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
}

export function toggleFilterTag(
  tags: ReadonlyArray<string>,
  tag: string,
  allTag: string,
): string[] {
  const normalized = tag.trim().toLocaleLowerCase();

  if (normalized === allTag.toLocaleLowerCase()) {
    return [];
  }

  return tags.includes(normalized)
    ? tags.filter((item) => item !== normalized)
    : [...tags, normalized];
}
