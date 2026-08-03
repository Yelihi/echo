import type { MemorizationEditorDraft } from "@/views/memorization/models/editor";

export type MemorizationEditorAction =
  | {
      type: "set_title";
      title: string;
    }
  | {
      type: "set_tags";
      tags: string[];
    }
  | {
      type: "set_raw_text";
      rawText: string;
    }
  | {
      type: "set_paragraphs";
      paragraphs: string[];
    }
  | {
      type: "update_paragraph";
      index: number;
      value: string;
    }
  | {
      type: "merge_paragraph";
      index: number;
    }
  | {
      type: "delete_paragraph";
      index: number;
    }
  | {
      type: "confirm_paragraphs";
      paragraphs: string[];
    };

const withUnconfirmedParagraphs = (
  draft: MemorizationEditorDraft,
  changes: Partial<Pick<MemorizationEditorDraft, "rawText" | "paragraphs">>,
): MemorizationEditorDraft => ({
  ...draft,
  ...changes,
  ...(draft.confirmed ? { confirmed: false } : {}),
});

export function memorizationEditorReducer(
  draft: MemorizationEditorDraft,
  action: MemorizationEditorAction,
): MemorizationEditorDraft {
  switch (action.type) {
    case "set_title":
      return { ...draft, title: action.title };
    case "set_tags":
      return { ...draft, tags: action.tags };
    case "set_raw_text":
      return withUnconfirmedParagraphs(draft, { rawText: action.rawText });
    case "set_paragraphs":
      return withUnconfirmedParagraphs(draft, { paragraphs: action.paragraphs });
    case "update_paragraph":
      return withUnconfirmedParagraphs(draft, {
        paragraphs: draft.paragraphs.map((paragraph, index) =>
          index === action.index ? action.value : paragraph,
        ),
      });
    case "merge_paragraph":
      if (action.index === 0) return draft;

      return withUnconfirmedParagraphs(draft, {
        paragraphs: draft.paragraphs.reduce<string[]>((paragraphs, paragraph, index) => {
          if (index === action.index - 1) {
            paragraphs.push(`${paragraph} ${draft.paragraphs[action.index]}`.trim());
            return paragraphs;
          }

          if (index !== action.index) paragraphs.push(paragraph);
          return paragraphs;
        }, []),
      });
    case "delete_paragraph":
      return withUnconfirmedParagraphs(draft, {
        paragraphs: draft.paragraphs.filter((_, index) => index !== action.index),
      });
    case "confirm_paragraphs":
      return { ...draft, paragraphs: action.paragraphs, confirmed: true };
  }
}
