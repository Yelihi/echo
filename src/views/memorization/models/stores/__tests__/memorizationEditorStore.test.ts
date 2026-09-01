import { afterEach, describe, expect, it } from "@jest/globals";

import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

describe("useMemorizationEditorStore", () => {
  afterEach(() => {
    useMemorizationEditorStore.getState().reset();
  });

  it("should clear stale paragraphs when the source text changes", () => {
    const store = useMemorizationEditorStore.getState();
    store.setParagraphs(["I hope this email finds you well."]);
    store.confirmParagraphs(["I hope this email finds you well."]);

    useMemorizationEditorStore.getState().setRawText("Could you please share your availability?");

    expect(useMemorizationEditorStore.getState().draft).toMatchObject({
      rawText: "Could you please share your availability?",
      paragraphs: [],
      confirmed: false,
    });
  });

  it("should keep paragraphs when the source text is unchanged", () => {
    const store = useMemorizationEditorStore.getState();
    store.setRawText("I hope this email finds you well.");
    store.setParagraphs(["I hope this email finds you well."]);
    store.confirmParagraphs(["I hope this email finds you well."]);

    useMemorizationEditorStore.getState().setRawText("I hope this email finds you well.");

    expect(useMemorizationEditorStore.getState().draft).toMatchObject({
      rawText: "I hope this email finds you well.",
      paragraphs: ["I hope this email finds you well."],
      confirmed: true,
    });
  });
});
