export function buildParagraphSuggestionPrompt(text: string): string {
  return [
    "Input memorization passage:",
    text,
    "",
    "Rules:",
    "- Split the passage into meaningful paragraphs for sentence memorization.",
    "- Preserve original English sentence text.",
    "- Keep sentence order inside each paragraph.",
    "- Use null for translation unless the source text includes a clear translation.",
  ].join("\n");
}
