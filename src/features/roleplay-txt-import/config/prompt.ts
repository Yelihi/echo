export function buildRoleplayTxtImportPrompt(text: string): string {
  return [
    "Input TXT:",
    text,
    "",
    "Rules:",
    "- Detect exactly two speakers.",
    "- Map the learner/user speaker to role `me` and the conversation partner to role `partner`.",
    "- Preserve line order and original English text.",
    "- Use null for translation unless the source TXT includes a clear translation.",
  ].join("\n");
}
