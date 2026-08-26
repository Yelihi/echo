export function buildRoleplayTxtImportPrompt(text: string): string {
  return [
    "Input TXT:",
    text,
    "",
    "Validation:",
    "- The source TXT must be a conversational dialogue between exactly two distinct speakers.",
    "- Reject non-dialogue text such as narration-only text, explanatory prose, articles, notes, or monologues.",
    "- Reject conversations with more than two active speakers.",
    "- Do not fabricate, merge, or split speakers to satisfy the schema.",
    "- If there is insufficient evidence of exactly two speakers, return status `invalid_input`.",
    "",
    "Transformation:",
    "- Identify the two existing speakers.",
    "- Map the learner/user speaker to role `me`.",
    "- Map the conversation partner to role `partner`.",
    "- Preserve line order and original English text.",
    "- Use null for translation unless the source TXT includes a clear translation.",
    "",
    "Output:",
    "- Success: status `ok` with speakers and lines.",
    "- Validation failure: status `invalid_input` with empty speakers and lines.",
  ].join("\n");
}
