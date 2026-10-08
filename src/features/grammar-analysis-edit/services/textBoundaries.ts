/** Human-readable word boundaries; raw UTF-16 offsets remain a domain detail. */
export function getTextBoundaries(text: string) {
  const positions = new Set([0, text.length]);
  for (const match of text.matchAll(/\S+/gu)) {
    positions.add(match.index);
    positions.add(match.index + match[0].length);
  }
  return [...positions]
    .sort((a, b) => a - b)
    .map((position) => ({
      position,
      label: `${text.slice(Math.max(0, position - 24), position)}│${text.slice(position, position + 24)}`,
    }));
}
